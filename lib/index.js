import { createNotifier, StatusMessageType } from "./createNotifier.js";
(async function () {
    let notifier = await createNotifier({
        application_id: "test-notification-app",
        connectToExistingService: false,
        port: 7070,
    });
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
    notification.on(StatusMessageType.Activated, args => {
        console.dir(args);
    });
    notification.on(StatusMessageType.Dismissed, args => {
        console.dir(args);
    });
    await new Promise((x) => setTimeout(x, 10000));
    await notification.remove();
    await notifier.close();
})();
//# sourceMappingURL=index.js.map