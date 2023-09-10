import { StatusMessage } from './statusMessage.js';
import { Notifier } from './notifier.js';
export declare class Notification {
    private _notifier;
    id: string;
    private _eventEmitter;
    constructor(_notifier: Notifier, id: string);
    statusChanged(statusMessage: StatusMessage): boolean;
    onChange(listener: (statusMessage: StatusMessage) => void): void;
    remove(): Promise<void>;
}
