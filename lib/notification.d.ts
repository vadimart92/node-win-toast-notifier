import { StatusMessage } from './statusMessage.js';
export interface Notification {
    id: string;
    onChange(listener: (statusMessage: StatusMessage) => void): void;
    remove(): Promise<void>;
}
