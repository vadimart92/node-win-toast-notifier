import { Notifier } from './notifier.js';
export async function createNotifier(settings) {
    const notifier = new Notifier(settings);
    await notifier._waitForReady();
    return notifier;
}
//# sourceMappingURL=createNotifier.js.map