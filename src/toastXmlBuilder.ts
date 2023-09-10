import {
    NotificationAction,
    NotificationAudioConfig,
    NotificationBody,
    NotificationConfig,
    NotificationInput,
} from './notification-config.js';
import { XMLBuilder } from 'fast-xml-parser';

type KeyOf<T extends object> = Extract<keyof T, string>;

function mapToAttributes<T extends Record<string, unknown>>(
    obj?: T,
    propsToSkip?: Array<KeyOf<T>>
): Record<string, string> {
    if (!obj) {
        return {};
    }
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (!value || (propsToSkip as string[])?.includes(key)) {
            continue;
        }
        result[`@_${key}`] = value.toString();
    }
    return result;
}

function createTextNode<T extends Record<string, unknown>>(
    obj: T,
    contentProperty: KeyOf<T>,
    propsToSkip: Array<KeyOf<T>>
): Record<string, string> {
    return {
        '#text': obj[contentProperty] as string,
        ...mapToAttributes(obj, [...propsToSkip, contentProperty]),
    };
}

function buildBody(body: string | NotificationBody) {
    if (typeof body === 'string') {
        return { text: body };
    } else {
        const result: Record<string, unknown> = {};
        for (const item of body) {
            let items = result[item.type] as Array<unknown>;
            if (!items) {
                items = [];
                result[item.type] = items;
            }
            switch (item.type) {
                case 'text':
                    items.push(createTextNode(item, 'content', ['type']));
                    break;
                case 'image':
                    items.push({
                        ...mapToAttributes(item, ['type']),
                    });
                    break;
            }
        }
        return result;
    }
}

function buildAction(actionConfig: NotificationAction) {
    switch (actionConfig.actionType) {
        case 'action':
            return mapToAttributes(actionConfig, ['actionType']);
    }
    return {};
}

function buildInput(input: NotificationInput) {
    switch (input.type) {
        case 'text':
            return mapToAttributes(input, ['actionType']);
        case 'selection':
            return {
                ...mapToAttributes(input, ['actionType', 'selection']),
                selection: input.selection.map((s) => mapToAttributes(s)),
            };
    }
    return {};
}

function buildActions(config: NotificationConfig) {
    if (!config.actions) {
        return {};
    }
    let result: { action: NotificationAction[]; input: NotificationInput[] } = {
        action: [],
        input: [],
    };
    for (const action of config.actions) {
        result[action.actionType].push(action as any);
    }
    return {
        actions: {
            input: result.input
                .filter((x) => x.actionType === 'input')
                .map(buildInput),
            action: result.action
                .filter((x) => x.actionType === 'action')
                .map(buildAction),
        },
    };
}

export function buildNotificationXml(config: NotificationConfig): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
    });
    let jObj = {
        toast: {
            ...(config.audio ? { audio: mapToAttributes(config.audio) } : {}),
            ...(config.header
                ? { header: mapToAttributes(config.header) }
                : {}),
            visual: {
                binding: {
                    '@_template': 'ToastGeneric',
                    ...buildBody(config.body),
                },
            },
            ...buildActions(config),
        },
    };
    return builder.build(jObj);
}
