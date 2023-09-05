import events from "events";
export class Notification {
    _notifier;
    id;
    _eventEmitter;
    constructor(_notifier, id) {
        this._notifier = _notifier;
        this.id = id;
        this._eventEmitter = new events.EventEmitter();
    }
    statusChanged(statusMessage) {
        this._eventEmitter.emit(statusMessage.type, statusMessage);
        return true;
    }
    on(event, listener) {
        this._eventEmitter.on(event, listener);
    }
    async remove() {
        this._eventEmitter.removeAllListeners();
        await this._notifier.remove(this);
    }
}
//# sourceMappingURL=notification.js.map