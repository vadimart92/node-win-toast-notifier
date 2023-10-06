import {
  afterEach,
  beforeEach,
  describe,
  jest,
  test,
} from '@jest/globals';
import { createNotifier } from './createNotifier.js';
import { StatusMessageType } from './statusMessageType.js';
import { Notifier } from "./notifier.js";
import { Notification } from './notification.js';
import { exec } from 'child_process';
import { StatusMessage } from './statusMessage.js';
jest.setTimeout(60000);
// .\win-toast-notifier.exe register -a "notifier-test"
describe('notifications manual tests', () => {
  let notifier: Notifier;
  let notification: Notification;
  let sysNotification: Notification;
  let notificationTemplate: string;
  beforeEach(async () => {
    notifier = await createNotifier({
      application_id: 'notifier-test', // use process.execPath after start menu fix
    });
  });
  afterEach(async () => {
    await sysNotification?.remove();
    await notification?.remove();
    await notifier.close();
  });
  afterAll(() => {
    killNotifier();
  });

  function killNotifier(){
    exec(`taskkill /f /im win-toast-notifier.exe`);
  }

  async function createNotification(msg: string) {
    notification = await notifier.notifyRaw(
      notificationTemplate.replace('$msg', msg)
    );
  }

  async function expectStatus(
    type: StatusMessageType
  ): Promise<StatusMessage> {
    return new Promise((res, rej) => {
      notification.onChange((status) => {
        console.dir(status);
        if (status.type !== type) {
          rej(`Actual status: ${status.type} expected: ${type}`);
          return;
        }
        res(status);
      });
    });
  }

  describe('simple notification', () => {
    beforeEach(async () => {
      notificationTemplate = `<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >$msg</text>
        </binding>
    </visual>
</toast>`;
    });

    test('should raise Dismissed event', async () => {
      await createNotification('Dismiss this');
      await expectStatus(StatusMessageType.Dismissed);
      killNotifier();
      await new Promise<void>(r => setTimeout(r, 500));
      await createNotification('Dismiss this too');
      await expectStatus(StatusMessageType.Dismissed);
    });
  });
});
