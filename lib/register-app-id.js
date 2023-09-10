import { spawn } from 'child_process';
import { Notifier } from './notifier.js';
async function call(args) {
    console.debug(`Calling ${Notifier.BinaryPath} with ${args.join()}`);
    const process = spawn(Notifier.BinaryPath, args);
    const out = [];
    process.stdout.on('data', (chunk) => out.push(chunk.toString()));
    return new Promise((res, rej) => {
        process.on('exit', (code) => {
            if (code === 0) {
                res();
                console.debug(out.join());
            }
            else {
                rej(`Exit code: ${code}. Output: ${out.join()}`);
            }
        });
    });
}
export async function registerAppIdUsingShortcut(exePath) {
    let args = ['register', '-a', exePath];
    await call(args);
}
export async function unRegisterAppIdUsingShortcut(exePath) {
    let args = ['un-register', '-a', exePath];
    await call(args);
}
export async function registerAppId(app_id, displayName, pngIconPath) {
    let args = ['register', '-a', app_id];
    if (displayName) {
        args.push('-n', displayName);
    }
    if (pngIconPath) {
        args.push('-i', pngIconPath);
    }
    await call(args);
}
export async function unRegisterAppId(app_id) {
    let args = ['un-register', '-a', app_id];
    await call(args);
}
//# sourceMappingURL=register-app-id.js.map