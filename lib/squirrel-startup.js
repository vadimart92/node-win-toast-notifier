import path from 'path';
import { registerAppId, registerAppIdUsingShortcut, unRegisterAppId, unRegisterAppIdUsingShortcut, } from './register-app-id.js';
export async function registerOnSquirrelStartup(app_id, displayName, pngIconPath) {
    if (process.platform === 'win32') {
        const cmd = process.argv[1];
        const target = path.basename(process.execPath);
        if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
            try {
                await registerAppId(app_id, displayName, pngIconPath);
            }
            catch (e) {
                await registerAppIdUsingShortcut(target);
            }
            return true;
        }
        if (cmd === '--squirrel-uninstall') {
            try {
                await unRegisterAppId(app_id);
            }
            catch (e) {
                await unRegisterAppIdUsingShortcut(target);
            }
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=squirrel-startup.js.map