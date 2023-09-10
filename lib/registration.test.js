import { test } from '@jest/globals';
import { registerAppId, registerAppIdUsingShortcut, unRegisterAppId, unRegisterAppIdUsingShortcut, } from './register-app-id.js';
import * as fs from 'fs';
describe('registration', function () {
    describe('registerAppId', () => {
        describe('when app not registered', () => {
            test('registerAppId', async () => {
                await registerAppId('notifier-test-1', 'Some test app', `D:\\dev\\GitHub\\cimon\\src\\cimon-desktop\\icons\\green\\icon.png`);
            });
            describe('when app registered', () => {
                test('un-registerAppId', async () => {
                    await unRegisterAppId('notifier-test-1');
                });
            });
            describe('when user not allow registration', () => {
                test('registerAppId', async () => {
                    await expect(registerAppId('notifier-test-1', 'Some test app')).rejects.toMatch(/Exit code: 101(.|\s)*The operation was canceled by the user/gm);
                });
            });
        });
    });
    describe('registerAppIdUsingShortcut', () => {
        test('when not registered yet', async () => {
            const linkPath = `${process.env.APPDATA}\\Microsoft\\Windows\\Start Menu\\Programs\\node.lnk`;
            if (fs.existsSync(linkPath)) {
                fs.unlinkSync(linkPath);
            }
            await registerAppIdUsingShortcut(process.execPath);
            expect(fs.existsSync(linkPath)).toBeTruthy();
            await unRegisterAppIdUsingShortcut(process.execPath);
            expect(fs.existsSync(linkPath)).toBeFalsy();
        });
    });
});
//# sourceMappingURL=registration.test.js.map