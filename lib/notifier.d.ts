import { InternalNotification } from './internalNotification.js';
import { NotifierSettings } from './notifierSettings.js';
import { NotificationConfig } from './notification-config.js';
export declare const NOTIFIER_OPTIONS: {
    base_path: string;
    image_cache: {
        _folder_path: string;
        folder_name: string;
        folder_path: string;
    };
};
export declare class Notifier {
    static ExecutableName: string;
    static get BinaryPath(): string;
    private _process?;
    private _onReady?;
    private readonly _onReadyPromise;
    private _config;
    private _notifications;
    constructor(settings: NotifierSettings);
    private _processKilled;
    private _startService;
    _waitForReady(): Promise<void>;
    private _getHeaders;
    private _processIsRunning;
    private _getUrl;
    private _lastStatusMessageNumber;
    private _subscribeForEvents;
    close(): Promise<void>;
    notify(config: NotificationConfig): Promise<InternalNotification>;
    _precacheImages(config: NotificationConfig): Promise<NotificationConfig>;
    notifyRaw(xml: string): Promise<InternalNotification>;
    remove(notification: InternalNotification): Promise<void>;
}
