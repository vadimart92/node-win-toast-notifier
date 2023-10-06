import { afterEach, beforeEach, describe, jest, test, } from '@jest/globals';
import { createNotifier } from './createNotifier.js';
import { StatusMessageType } from './statusMessageType.js';
import { exec } from 'child_process';
jest.setTimeout(60000);
// .\win-toast-notifier.exe register -a "notifier-test"
describe('notifications manual tests', () => {
    let notifier;
    let notification;
    let sysNotification;
    let notificationTemplate;
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
    function killNotifier() {
        exec(`taskkill /f /im win-toast-notifier.exe`);
    }
    async function createNotification(msg) {
        notification = await notifier.notifyRaw(notificationTemplate.replace('$msg', msg));
    }
    async function expectStatus(type) {
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
            await new Promise(r => setTimeout(r, 500));
            await createNotification('Dismiss this too');
            await expectStatus(StatusMessageType.Dismissed);
        });
    });
});
//# sourceMappingURL=reconnection.test.js.map