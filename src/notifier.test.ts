import {afterEach, beforeEach, describe, expect, fit, jest, test} from "@jest/globals";
import { createNotifier } from "./createNotifier.js";
import { StatusMessageType } from "./statusMessageType.js";
import { Notifier } from "./notifier.js";
import { Notification } from "./notification.js";
import {exec, spawn} from "child_process";

jest.setTimeout(60000);
// .\win-toast-notifier.exe register -a "notifier-test"
describe("notifications manual tests", () => {
  let notifier: Notifier;
  let notification: Notification;
  let sysNotification: Notification;
  beforeEach(async () => {
    notifier = await createNotifier({
      application_id: "notifier-test", // use process.execPath after start menu fix
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
  })
  async function alert(msg: string){
    sysNotification = await notifier.notifyRaw(`<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >${msg}</text>
        </binding>
    </visual>
</toast>`)
  }

  describe("simple notification", () => {
    beforeEach(async () => {
      notification = await notifier.notifyRaw(`<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >Hello</text>
            <text >World</text>
        </binding>
    </visual>
</toast>`);
    });

    test("should raise Dismissed event", async () => {
      await alert('Dismiss!');
      await new Promise((r) => notification.on(StatusMessageType.Dismissed, status => {
        expect(status.type).toBe(StatusMessageType.Dismissed);
        r(true);
      }));
    });
    test("should raise Activated event when clicked", async () => {
      await alert('Click!');
      await new Promise((r) => notification.on(StatusMessageType.Activated, status => {
        expect(status.type).toBe(StatusMessageType.Activated);
        r(true);
      }));
    });
  });

  describe("notification with input", () => {
    beforeEach(async () => {
      notification = await notifier.notifyRaw(`<toast>
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
    </actions>
</toast>`);
    });
    it("should raise Dismissed event", async () => {
      await alert('Dismiss!');
      await new Promise((r) => notification.on(StatusMessageType.Dismissed, status => {
        expect(status.type).toBe(StatusMessageType.Dismissed);
        r(true);
      }));
    });
    it("should raise Activated event", async () => {
      await alert('Activate!');
      await new Promise((r) => notification.on(StatusMessageType.Activated, status => {
        console.dir(status);
        expect(status.type).toBe(StatusMessageType.Activated);
        expect(status.info?.actions['status']).toBe('yes');
        r(true);
      }));
    });
  });
  describe("notification with actions", () => {
    beforeEach(async () => {
      notification = await notifier.notifyRaw(`<toast>
    <visual>
        <binding template='ToastGeneric'>
            <text >AAA</text>
            <text >BBB</text>
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
</toast>`);
    });
    test("should raise Dismissed event", async () => {
      await alert('Dismiss!');
      await new Promise((r) => notification.on(StatusMessageType.Dismissed, status => {
        expect(status.type).toBe(StatusMessageType.Dismissed);
        r(true);
      }));
    });
    test.each(['button1', 'button2'])("should raise Activated event on %s button", async (arg) => {
      await alert(`Press ${arg}!`);
      await new Promise((r) => notification.on(StatusMessageType.Activated, status => {
        console.dir(status);
        expect(status.type).toBe(StatusMessageType.Activated);
        expect(status.info?.actions['status']).toBe('maybe');
        expect(status.info?.arguments).toBe(`action=${arg}`);
        r(true);
      }));
    })
  });
});
