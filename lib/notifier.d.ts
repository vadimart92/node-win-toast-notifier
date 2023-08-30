export declare class Notifier {
    private readonly _notifierPath;
    private readonly _process;
    constructor(settings: NotifierSettings);
}
export interface NotifierSettings {
    toastXML: string;
}
export declare function notifier(settings: NotifierSettings): Notifier;
