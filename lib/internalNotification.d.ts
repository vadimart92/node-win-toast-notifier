import { StatusMessage } from './statusMessage.js';
import { Notifier } from './notifier.js';
import { Notification } from './notification.js';
export declare class InternalNotification implements Notification {
    private _notifier;
    id: string;
    private _eventEmitter;
    constructor(_notifier: Notifier, id: string);
    emitStatusChanged(statusMessage: StatusMessage): boolean;
    onChange(listener: (statusMessage: StatusMessage) => void): void;
    remove(): Promise<void>;
}
