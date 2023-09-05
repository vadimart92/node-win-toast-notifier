import { Notifier } from "./notifier.cjs";
export async function createNotifier(settings) {
    const notifier = new Notifier(settings);
    await notifier._waitForReady();
    return notifier;
}
//# sourceMappingURL=createNotifier.cjs.map