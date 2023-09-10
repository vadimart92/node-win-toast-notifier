import { afterEach, beforeEach, describe, expect, jest, test, } from '@jest/globals';
import { createNotifier } from './createNotifier.js';
import { StatusMessageType } from './statusMessageType.js';
import { exec } from 'child_process';
import { buildNotificationXml } from './toastXmlBuilder.js';
import { NotificationSounds } from './notification-config.js';
jest.setTimeout(60000);
// .\win-toast-notifier.exe register -a "notifier-test"
describe('notifications manual tests', () => {
    let notifier;
    let notification;
    let sysNotification;
    let notificationTemplate;
    beforeEach(async () => {
        notifier = await createNotifier({
            application_id: 'notifier-test',
            connectToExistingService: false,
            port: 7070,
        });
    });
    afterEach(async () => {
        await sysNotification?.remove();
        await notification.remove();
        await notifier.close();
    });
    afterAll(() => {
        exec(`taskkill /f /im win-toast-notifier.exe`);
    });
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
            const status = await expectStatus(StatusMessageType.Dismissed);
            expect(status).toBeDefined();
        });
        test('should raise Activated event when clicked', async () => {
            await createNotification('click this');
            const status = await expectStatus(StatusMessageType.Activated);
            expect(status).toBeDefined();
        });
    });
    describe('notification with input', () => {
        beforeEach(async () => {
            notificationTemplate = `<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >$msg</text>
        </binding>
    </visual>
    <actions>
        <input id="status" type="selection" defaultInput="yes">
            <selection id="yes" content="Going"/>
            <selection id="maybe" content="Maybe"/>
            <selection id="no" content="Decline"/>
        </input>
    </actions>
</toast>`;
        });
        it('should raise Dismissed event', async () => {
            await createNotification('Dismiss this');
            const status = await expectStatus(StatusMessageType.Dismissed);
            expect(status).toBeDefined();
        });
        it('should raise Activated event', async () => {
            await createNotification('click this');
            const status = await expectStatus(StatusMessageType.Activated);
            expect(status).toBeDefined();
            expect(status.info?.inputs['status']).toBe('yes');
        });
    });
    describe('notification with actions', () => {
        beforeEach(async () => {
            notificationTemplate = `<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >$msg</text>
        </binding>
    </visual>
    <actions>
        <input id="status" type="selection" defaultInput="maybe">
            <selection id="no" content="Decline"/>
            <selection id="maybe" content="Maybe"/>
        </input>
        <action content='Button 1' arguments='action=button1'/>
        <action content='Button 2' arguments='action=button2'/>
    </actions>
</toast>`;
        });
        test('should raise Dismissed event', async () => {
            await createNotification('Dismiss this');
            const status = await expectStatus(StatusMessageType.Dismissed);
            expect(status).toBeDefined();
        });
        test.each(['button1', 'button2'])('should raise Activated event on %s button', async (arg) => {
            await createNotification(`click ${arg}`);
            const status = await expectStatus(StatusMessageType.Activated);
            expect(status).toBeDefined();
            expect(status.info?.inputs['status']).toBe('maybe');
            expect(status.info?.arguments).toBe(`action=${arg}`);
        });
    });
    describe('when config provided', () => {
        beforeEach(() => {
            notificationTemplate = buildNotificationXml({
                audio: { src: NotificationSounds.IM },
                body: [
                    {
                        type: 'text',
                        content: 'Reply to me:',
                    },
                    {
                        type: 'text',
                        content: 'x',
                        placement: 'attribution',
                    },
                ],
                actions: [
                    {
                        actionType: 'action',
                        content: 'Some button',
                        arguments: 'someButtonClicked',
                    },
                    {
                        actionType: 'input',
                        type: 'text',
                        placeHolderContent: 'Reply',
                        id: 'replyId',
                    },
                    {
                        actionType: 'action',
                        content: 'Send',
                        arguments: 'sendReply',
                        'hint-inputId': 'replyId',
                    },
                    {
                        actionType: 'input',
                        type: 'selection',
                        id: 'vars',
                        defaultInput: 'yep',
                        selection: [
                            {
                                id: 'yep',
                                content: 'Yes',
                            },
                            {
                                id: 'no',
                                content: 'Nope',
                            },
                        ],
                    },
                ],
            });
        });
        test('should raise Dismissed event', async () => {
            await createNotification('dismiss this');
            const status = await expectStatus(StatusMessageType.Activated);
            expect(status.info?.arguments).toBe('sendReply');
            expect(status.info?.inputs['replyId']).toBe('x');
            expect(status.info?.inputs['vars']).toBe('yep');
            await notification.remove();
        });
    });
});
//# sourceMappingURL=notifier.test.js.map