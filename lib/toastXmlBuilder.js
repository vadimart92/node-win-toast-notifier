import { XMLBuilder } from 'fast-xml-parser';
function mapToAttributes(obj, propsToSkip) {
    if (!obj) {
        return {};
    }
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (!value || propsToSkip?.includes(key)) {
            continue;
        }
        result[`@_${key}`] = value.toString();
    }
    return result;
}
function createTextNode(obj, contentProperty, propsToSkip) {
    return {
        '#text': obj[contentProperty],
        ...mapToAttributes(obj, [...propsToSkip, contentProperty]),
    };
}
function buildBody(body) {
    if (typeof body === 'string') {
        return { text: body };
    }
    else {
        const result = {};
        for (const item of body) {
            let items = result[item.type];
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
function buildAction(actionConfig) {
    switch (actionConfig.actionType) {
        case 'action':
            return mapToAttributes(actionConfig, ['actionType']);
    }
    return {};
}
function buildInput(input) {
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
function buildActions(config) {
    if (!config.actions) {
        return {};
    }
    let result = {
        action: [],
        input: [],
    };
    for (const action of config.actions) {
        result[action.actionType].push(action);
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
export function buildNotificationXml(config) {
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
//# sourceMappingURL=toastXmlBuilder.js.map