import { NotifierSettings } from "./notifierSettings.js";
import { Notifier } from "./notifier.js";

export async function createNotifier(
  settings: NotifierSettings,
): Promise<Notifier> {
  const notifier = new Notifier(settings);
  await notifier._waitForReady();
  return notifier;
}
