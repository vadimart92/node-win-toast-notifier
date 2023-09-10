import { Notification } from './notification.js';
import { NotifierSettings } from './notifierSettings.js';
import { NotificationConfig } from './notification-config.js';
export declare class Notifier {
    static BinaryPath: string;
    private _process?;
    private _onReady?;
    private readonly _onReadyPromise;
    private _config;
    private _notifications;
    constructor(settings: NotifierSettings);
    private _startService;
    _waitForReady(): Promise<void>;
    private _getHeaders;
    private _getUrl;
    private _lastStatusMessageNumber;
    private _subscribeForEvents;
    close(): Promise<void>;
    notify(config: NotificationConfig): Promise<Notification>;
    notifyRaw(xml: string): Promise<Notification>;
    remove(notification: Notification): Promise<void>;
}
