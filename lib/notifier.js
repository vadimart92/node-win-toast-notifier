"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifier = exports.Notifier = void 0;
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
class Notifier {
    _notifierPath;
    _process;
    constructor(settings) {
        this._notifierPath = path.resolve(__dirname, '../bin/win-toast-notifier.exe');
        this._process = (0, child_process_1.spawn)(this._notifierPath, ['listen', '-p', '0', '-a', '"test-notification-app"']);
        this._process.on('data', data => {
            console.log(`stdout: ${data}`);
        });
        this._process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        this._process.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }
}
exports.Notifier = Notifier;
function notifier(settings) {
    return new Notifier(settings);
}
exports.notifier = notifier;
//# sourceMappingURL=notifier.js.map