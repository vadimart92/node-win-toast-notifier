import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { InternalNotification } from './internalNotification.js';
import { NotifierSettings } from './notifierSettings.js';
import path from 'path';
import fetch, { HeadersInit } from 'node-fetch';
import { StatusMessage } from './statusMessage.js';
import {
    NotificationConfig,
    NotificationImage,
} from './notification-config.js';
import { buildNotificationXml } from './toastXmlBuilder.js';
import { fileURLToPath } from 'url';
import { downloadFile } from './network-utils.js';

interface NotifierConfig {
    application_id: string;
    api_key?: string;
    ip?: string;
    port?: number;
    connectedToExistingService?: boolean;
}

interface NotifyResponse {
    id: string;
}

export const NOTIFIER_OPTIONS = {
    base_path: path.dirname(fileURLToPath(import.meta.url)),
    image_cache: {
        _folder_path: '',
        folder_name: 'image-cache',
        set folder_path(value: string) {
            this._folder_path = value;
        },
        get folder_path() {
            return (
                this._folder_path ||
                path.resolve(NOTIFIER_OPTIONS.base_path, this.folder_name)
            );
        },
    },
};

export class Notifier {
    public static ExecutableName: string = 'win-toast-notifier.exe';

    public static get BinaryPath(): string {
        return path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            `../bin/${Notifier.ExecutableName}`
        );
    }

    private _process?: ChildProcessWithoutNullStreams;
    private _onReady?: Function;
    private readonly _onReadyPromise: Promise<void>;
    private _config: NotifierConfig = {
        api_key: undefined,
        ip: '127.0.0.1',
        application_id: '',
        connectedToExistingService: false,
    };
    private _notifications: Map<string, InternalNotification> = new Map<
        string,
        InternalNotification
    >();

    constructor(settings: NotifierSettings) {
        this._onReadyPromise = new Promise(
            (resolve) => (this._onReady = resolve)
        );
        this._config.port = settings.port;
        this._config.api_key = settings.api_key ?? this._config.api_key;
        this._config.application_id =
            settings.application_id ?? this._config.application_id;
        this._config.ip = settings.ip ?? this._config.ip;
        if (settings.connectToExistingService) {
            this._config.connectedToExistingService = true;
            this._subscribeForEvents();
            this._onReady?.();
            return;
        }
        this._startService().then(() => {
            this._onReady?.();
        });
    }

    private _processKilled: boolean = false;

    private async _startService() {
        return new Promise<void>((resolve) => {
            let args = ['listen', '-a', this._config.application_id];
            if (this._config.port) {
                args.push('-p', this._config.port.toString());
            }
            if (this._config.api_key) {
                args.push('-k', this._config.api_key.toString());
            }
            this._process = spawn(Notifier.BinaryPath, args);
            let fullData = '';
            this._process.stdout.on('data', (data) => {
                fullData += data;
                try {
                    this._config = JSON.parse(fullData) as NotifierConfig;
                    console.debug(`CONFIG: ${fullData}`);
                    this._subscribeForEvents();
                    resolve();
                } catch (e) {}
            });
            this._process.stderr.on('data', (data) => {
                console.error(`Notifier error: ${data}`);
            });
            this._process.on('close', (code) => {
                this._processKilled = true;
                if (code !== 0)
                    console.debug(`child process exited with code ${code}`);
            });
        });
    }

    _waitForReady(): Promise<void> {
        return this._onReadyPromise ?? Promise.resolve();
    }

    private _getHeaders(): HeadersInit {
        return {
            'api-key': this._config.api_key!,
        };
    }

    private _processIsRunning() {
        if (!this._process?.pid){
            return false;
        }
        try {
            process.kill(this._process?.pid, 0);
            return true;
        } catch(e) {
            return false;
        }
    }
    private async _getUrl(path: string) {
        if (
            !this._processIsRunning() &&
            !this._config.connectedToExistingService
        ) {
            console.debug('Process not running. Starting...');
            await this._startService();
        }
        return `http://${this._config.ip}:${this._config.port}/${path}`;
    }

    private _lastStatusMessageNumber: number = 0;

    private async _subscribeForEvents() {
        const response = await fetch(
            await this._getUrl(
                `status-stream?from=${this._lastStatusMessageNumber}`
            ),
            {
                headers: this._getHeaders(),
            }
        );
        if (!response.body) {
            console.error(`Could not subscribe to status stream`);
            return;
        }
        let lastChunk = '';
        try {
            for await (const chunkBuffer of response.body) {
                let chunk = lastChunk + chunkBuffer.toString();
                lastChunk = '';
                let lines = chunk?.split('\n');
                try {
                    for (const line of lines) {
                        if (!line?.length) {
                            continue;
                        }
                        let statusMessage = JSON.parse(line) as StatusMessage;
                        let notification = this._notifications.get(
                            statusMessage.id
                        );
                        if (notification) {
                            if (notification.emitStatusChanged(statusMessage)) {
                                this._notifications.delete(statusMessage.id);
                            }
                        }
                    }
                } catch (err) {
                    if (lines?.length) {
                        lastChunk += lines[lines.length - 1];
                    }
                }
            }
        } catch (e) {}
    }

    async close() {
        if (!this._config.connectedToExistingService) {
            const result = await fetch(await this._getUrl('quit'), {
                headers: this._getHeaders(),
            });
            const response = await result.text();
            console.debug(`App quit: ${response}`);
            this._process?.kill('SIGTERM');
        }
    }

    async notify(config: NotificationConfig) {
        if (config.settings?.image_cache?.enable) {
            config = await this._precacheImages(config);
        }
        let xml = buildNotificationXml(config);
        return await this.notifyRaw(xml);
    }

    async _precacheImages(config: NotificationConfig) {
        const body = config.body;
        if (!body.length) {
            return config;
        }
        const result = { ...config };
        for (const item of body) {
            const image = item as NotificationImage;
            if (image.type === 'image' && image.src?.startsWith('http')) {
                image.src = await downloadFile(
                    image.src,
                    NOTIFIER_OPTIONS.image_cache.folder_path,
                    config.settings?.image_cache?.expiration_timeout_seconds ??
                        5 * 60
                );
            }
        }
        return result;
    }

    async notifyRaw(xml: string) {
        let url = await this._getUrl('notify');
        let config = {
            method: 'POST',
            body: JSON.stringify({
                toast_xml: xml,
            }),
            headers: this._getHeaders(),
        };
        let response = await fetch(url, config);
        if (response.status === 401) {
            if (this._config.connectedToExistingService) {
                throw `You specified connectToExistingService: true, provide valid api_key, current api_key: ${this._config.api_key}`;
            }
        }
        if (!response.ok) {
            throw response.statusText;
        }
        let response_json = (await response.json()) as NotifyResponse;
        let notification = new InternalNotification(this, response_json.id);
        this._notifications.set(notification.id, notification);
        return notification;
    }

    async remove(notification: InternalNotification) {
        console.debug(`Removing ${notification.id}`);
        let result = await fetch(
            await this._getUrl(`notification?id=${notification.id}`),
            {
                headers: this._getHeaders(),
                method: 'DELETE',
            }
        );
        if (result.ok) {
            console.debug(`Removed ${notification.id}`);
        }
    }
}
