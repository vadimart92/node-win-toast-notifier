// https://learn.microsoft.com/en-us/uwp/schemas/tiles/toastschema/schema-root

export type NotificationAction = {
    actionType: 'action';
    content: string;
    imageUri?: string;
    arguments: string;
    activationType?: 'foreground' | 'background' | 'protocol';
    placement?: 'contextMenu';
    'hint-inputId'?: string;
    'hint-buttonStyle'?: 'Success' | 'Critical';
    'hint-toolTip'?: string;
};

export type NotificationActionInput = {
    actionType: 'input';
    id: string;
};

export type NotificationActionTextInput = NotificationActionInput & {
    type: 'text';
    placeHolderContent?: string;
};

export type NotificationActionSelectionInput = NotificationActionInput & {
    type: 'selection';
    defaultInput?: string;
    selection: NotificationActionSelectionItem[];
};

export type NotificationActionSelectionItem = {
    id: string;
    content: string;
};

export type NotificationInput =
    | NotificationActionTextInput
    | NotificationActionSelectionInput;

export enum NotificationLoopingSounds {
    Alarm1 = 'ms-winsoundevent:Notification.Looping.Alarm',
    Alarm2 = 'ms-winsoundevent:Notification.Looping.Alarm2',
    Alarm3 = 'ms-winsoundevent:Notification.Looping.Alarm3',
    Alarm4 = 'ms-winsoundevent:Notification.Looping.Alarm4',
    Alarm5 = 'ms-winsoundevent:Notification.Looping.Alarm5',
    Alarm6 = 'ms-winsoundevent:Notification.Looping.Alarm6',
    Alarm7 = 'ms-winsoundevent:Notification.Looping.Alarm7',
    Alarm8 = 'ms-winsoundevent:Notification.Looping.Alarm8',
    Alarm9 = 'ms-winsoundevent:Notification.Looping.Alarm9',
    Alarm10 = 'ms-winsoundevent:Notification.Looping.Alarm10',
    Call1 = 'ms-winsoundevent:Notification.Looping.Call',
    Call2 = 'ms-winsoundevent:Notification.Looping.Call2',
    Call3 = 'ms-winsoundevent:Notification.Looping.Call3',
    Call4 = 'ms-winsoundevent:Notification.Looping.Call4',
    Call5 = 'ms-winsoundevent:Notification.Looping.Call5',
    Call6 = 'ms-winsoundevent:Notification.Looping.Call6',
    Call7 = 'ms-winsoundevent:Notification.Looping.Call7',
    Call8 = 'ms-winsoundevent:Notification.Looping.Call8',
    Call9 = 'ms-winsoundevent:Notification.Looping.Call9',
    Call10 = 'ms-winsoundevent:Notification.Looping.Call10',
}

export enum NotificationSounds {
    Default = 'ms-winsoundevent:Notification.Default',
    IM = 'ms-winsoundevent:Notification.IM',
    Mail = 'ms-winsoundevent:Notification.Mail',
    Reminder = 'ms-winsoundevent:Notification.Reminder',
    SMS = 'ms-winsoundevent:Notification.SMS',
}

export type NotificationAudioConfig = {
    silent?: boolean;
    loop?: boolean;
    src?: NotificationSounds | NotificationLoopingSounds | string;
};

export type NotificationSettings = {
    image_cache?: {
        enable?: true,
        expiration_timeout_seconds?: number
    }
}
export type NotificationConfig = {
    body: string | NotificationBody;
    actions?: Array<NotificationAction | NotificationInput>;
    audio?: NotificationAudioConfig;
    header?: NotificationHeader;
    settings?: NotificationSettings
};

export type NumericId = {
    id?: number;
};

export type NotificationImage = NumericId & {
    type: 'image';
    src: string;
    alt?: string;
    addImageQuery?: boolean;
    placement?: 'appLogoOverride' | 'hero';
    'hint-crop'?: 'circle';
};

export type NotificationText = NumericId & {
    type: 'text';
    lang?: string;
    placement?: 'attribution';
    content: string;
};

export type NotificationBody = Array<NotificationImage | NotificationText>;

export type NotificationHeader = {
    id: string;
    title: string;
    arguments: string;
    activationType?: 'foreground' | 'protocol';
};
