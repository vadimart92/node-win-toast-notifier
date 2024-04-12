import events from 'events';
import { StatusMessage } from './statusMessage.js';
import { Notifier } from './notifier.js';
import { Notification } from './notification.js';

export class InternalNotification implements Notification {
    private _eventEmitter;

    constructor(
        private _notifier: Notifier,
        public id: string
    ) {
        this._eventEmitter = new events.EventEmitter();
    }

    emitStatusChanged(statusMessage: StatusMessage) {
        this._eventEmitter.emit('state-change', statusMessage);
        return true;
    }

    onChange(listener: (statusMessage: StatusMessage) => void) {
        this._eventEmitter.on('state-change', listener);
    }

    async remove() {
        this._eventEmitter.removeAllListeners();
        await this._notifier.remove(this);
    }
}
