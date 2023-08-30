declare enum DismissReason {
    ApplicationHidden = "ApplicationHidden",
    UserCanceled = "UserCanceled",
    TimedOut = "TimedOut"
}
export declare enum StatusMessageType {
    Activated = "Activated",
    Dismissed = "Dismissed",
    DismissedError = "DismissedError",
    Failed = "Failed"
}
interface StatusMessage {
    id: string;
    info?: StatusMessageInfo;
    dismissReason?: DismissReason;
    type: StatusMessageType;
    description: string;
}
interface StatusMessageInfo {
    actions: Record<string, string>;
    arguments: string;
}
export declare class Notifier {
    private readonly _notifierPath;
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
    notify(xml: string): Promise<Notification>;
    remove(notification: Notification): Promise<void>;
}
declare class Notification {
    private _notifier;
    id: string;
    private _eventEmitter;
    constructor(_notifier: Notifier, id: string);
    statusChanged(statusMessage: StatusMessage): boolean;
    on(event: StatusMessageType, listener: (...args: any[]) => void): void;
    remove(): Promise<void>;
}
export interface NotifierSettings {
    application_id: string;
    ip?: string;
    port?: number;
    api_key?: string;
    connectToExistingService: boolean;
}
export declare function createNotifier(settings: NotifierSettings): Promise<Notifier>;
export {};
