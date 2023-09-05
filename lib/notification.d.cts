import { StatusMessageType } from "./statusMessageType.cjs";
import { StatusMessage } from "./statusMessage.cjs";
import { Notifier } from "./notifier.cjs";
export declare class Notification {
    private _notifier;
    id: string;
    private _eventEmitter;
    constructor(_notifier: Notifier, id: string);
    statusChanged(statusMessage: StatusMessage): boolean;
    on(event: StatusMessageType, listener: (...args: any[]) => void): void;
    remove(): Promise<void>;
}
