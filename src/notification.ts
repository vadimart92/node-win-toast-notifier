import events from "events";
import {StatusMessageType} from "./statusMessageType.js";
import {StatusMessage} from "./statusMessage.js";
import {Notifier} from "./notifier.js";

export class Notification {
    private _eventEmitter;

    constructor(
        private _notifier: Notifier,
        public id: string,
    ) {
        this._eventEmitter = new events.EventEmitter();
    }

    statusChanged(statusMessage: StatusMessage) {
        this._eventEmitter.emit(statusMessage.type, statusMessage);
        return true;
    }

    public on(event: StatusMessageType, listener: (statusMessage: StatusMessage) => void) {
        this._eventEmitter.on(event, listener);
    }

    async remove() {
        this._eventEmitter.removeAllListeners();
        await this._notifier.remove(this);
    }
}