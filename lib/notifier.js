import { spawn } from 'child_process';
import { Notification } from './notification.js';
import path from 'path';
import fetch from 'node-fetch';
import { buildNotificationXml } from './toastXmlBuilder.js';
import { fileURLToPath } from 'url';
import { downloadFile } from './network-utils.js';
export const NOTIFIER_OPTIONS = {
    base_path: path.dirname(fileURLToPath(import.meta.url)),
    image_cache: {
        _folder_path: '',
        folder_name: 'image-cache',
        set folder_path(value) {
            this._folder_path = value;
        },
        get folder_path() {
            return this._folder_path || path.resolve(NOTIFIER_OPTIONS.base_path, this.folder_name);
        }
    },
};
export class Notifier {
    static ExecutableName = 'win-toast-notifier.exe';
    static get BinaryPath() {
        return path.resolve(path.dirname(fileURLToPath(import.meta.url)), `../bin/${Notifier.ExecutableName}`);
    }
    _process;
    _onReady;
    _onReadyPromise;
    _config = {
        api_key: '1',
        ip: '127.0.0.1',
        application_id: '',
        connectedToExistingService: false,
    };
    _notifications = new Map();
    constructor(settings) {
        this._onReadyPromise = new Promise((resolve) => (this._onReady = resolve));
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
        this._startService();
    }
    _startService() {
        let args = [
            'listen',
            '-k',
            this._config.api_key,
            '-a',
            this._config.application_id,
        ];
        if (this._config.port) {
            args.push('-p', this._config.port.toString());
        }
        this._process = spawn(Notifier.BinaryPath, args);
        let fullData = '';
        this._process.stdout.on('data', (data) => {
            fullData += data;
            try {
                this._config = JSON.parse(fullData);
                console.debug(`CONFIG: ${fullData}`);
                this._subscribeForEvents();
                this._onReady?.();
            }
            catch (e) { }
        });
        this._process.stderr.on('data', (data) => {
            console.error(`Notifier error: ${data}`);
        });
        this._process.on('close', (code) => {
            if (code !== 0)
                console.debug(`child process exited with code ${code}`);
        });
    }
    _waitForReady() {
        return this._onReadyPromise ?? Promise.resolve();
    }
    _getHeaders() {
        return {
            'api-key': this._config.api_key,
        };
    }
    _getUrl(path) {
        return `http://${this._config.ip}:${this._config.port}/${path}`;
    }
    _lastStatusMessageNumber = 0;
    async _subscribeForEvents() {
        const response = await fetch(this._getUrl(`status-stream?from=${this._lastStatusMessageNumber}`), {
            headers: this._getHeaders(),
        });
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
                        let statusMessage = JSON.parse(line);
                        let notification = this._notifications.get(statusMessage.id);
                        if (notification) {
                            if (notification.statusChanged(statusMessage)) {
                                this._notifications.delete(statusMessage.id);
                            }
                        }
                    }
                }
                catch (err) {
                    if (lines?.length) {
                        lastChunk += lines[lines.length - 1];
                    }
                }
            }
        }
        catch (e) { }
    }
    async close() {
        if (!this._config.connectedToExistingService) {
            const result = await fetch(this._getUrl('quit'), {
                headers: this._getHeaders(),
            });
            const response = await result.text();
            console.debug(`App quit: ${response}`);
            this._process?.kill('SIGTERM');
        }
    }
    async notify(config) {
        if (config.settings?.image_cache?.enable) {
            config = await this._precacheImages(config);
        }
        let xml = buildNotificationXml(config);
        return await this.notifyRaw(xml);
    }
    async _precacheImages(config) {
        const body = config.body;
        if (!body.length) {
            return config;
        }
        const result = { ...config };
        for (const item of body) {
            const image = item;
            if (image.type === 'image' && image.src?.startsWith('http')) {
                image.src = await downloadFile(image.src, NOTIFIER_OPTIONS.image_cache.folder_path, config.settings?.image_cache?.expiration_timeout_seconds ??
                    5 * 60);
            }
        }
        return result;
    }
    async notifyRaw(xml) {
        let url = this._getUrl('notify');
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
        let response_json = (await response.json());
        let notification = new Notification(this, response_json.id);
        this._notifications.set(notification.id, notification);
        return notification;
    }
    async remove(notification) {
        console.debug(`Removing ${notification.id}`);
        let result = await fetch(this._getUrl(`notification?id=${notification.id}`), {
            headers: this._getHeaders(),
            method: 'DELETE',
        });
        if (result.ok) {
            console.debug(`Removed ${notification.id}`);
        }
    }
}
//# sourceMappingURL=notifier.js.map