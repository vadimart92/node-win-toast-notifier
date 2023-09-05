import { beforeEach, describe, test } from "@jest/globals";
import { createNotifier } from "./createNotifier.cjs";
import { StatusMessageType } from "./statusMessageType.cjs";
describe("notifications manual tests", () => {
    let notifier;
    let notification;
    beforeEach(async () => {
        notifier = await createNotifier({
            application_id: "test-notification-app",
            connectToExistingService: false,
            port: 7070,
        });
    });
    describe("simple notification", async () => {
        beforeEach(async () => {
            notification = await notifier.notify(`<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >Hello</text>
            <text >World</text>
        </binding>
    </visual>
</toast>`);
        });
        it('should raise Dismissed event', async () => {
            await new Promise((r) => notification.on(StatusMessageType.Dismissed, r));
        });
    });
    describe("notification with input", () => { });
    describe("notification with actions", () => { });
    test("notify", async () => {
        let notification = await notifier.notify(`<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >AAA</text>
            <text >BBB</text>
        </binding>
    </visual>
    <actions>
        <input id="status" type="selection" defaultInput="yes">
            <selection id="yes" content="Going"/>
            <selection id="maybe" content="Maybe"/>
            <selection id="no" content="Decline"/>
        </input>
        <action content='Open' arguments='action=open'/>
        <action content='WIP' arguments='action=wip'/>
        <action content='Rollback' arguments='action=rollback'/>
        <action content='Mute' arguments='action=mute'/>
    </actions>
</toast>`);
        notification.on(StatusMessageType.Activated, (args) => {
            console.dir(args);
        });
        notification.on(StatusMessageType.Dismissed, (args) => {
            console.dir(args);
        });
        await new Promise((x) => setTimeout(x, 10000));
        await notification.remove();
        await notifier.close();
    });
});
//# sourceMappingURL=notifier.test.cjs.map