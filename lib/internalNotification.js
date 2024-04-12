import events from 'events';
export class InternalNotification {
    _notifier;
    id;
    _eventEmitter;
    constructor(_notifier, id) {
        this._notifier = _notifier;
        this.id = id;
        this._eventEmitter = new events.EventEmitter();
    }
    emitStatusChanged(statusMessage) {
        this._eventEmitter.emit('state-change', statusMessage);
        return true;
    }
    onChange(listener) {
        this._eventEmitter.on('state-change', listener);
    }
    async remove() {
        this._eventEmitter.removeAllListeners();
        await this._notifier.remove(this);
    }
}
//# sourceMappingURL=internalNotification.js.map