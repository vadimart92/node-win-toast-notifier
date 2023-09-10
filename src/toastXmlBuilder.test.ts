import { test } from '@jest/globals';
import { buildNotificationXml } from './toastXmlBuilder.js';
import { NotificationSounds } from './notification-config.js';

describe('builder tests', () => {
    test('when body is string', () => {
        const result = buildNotificationXml({
            body: 'hello',
        });
        expect(result).toMatchSnapshot();
    });
    test('when body is object', () => {
        const result = buildNotificationXml({
            body: [
                {
                    type: 'text',
                    content: 'Test header',
                },
                {
                    type: 'text',
                    content: 'Test attribution',
                    placement: 'attribution',
                },
                {
                    type: 'image',
                    src: 'my-img',
                    placement: 'appLogoOverride',
                    'hint-crop': 'circle',
                    alt: 'Logo',
                },
                {
                    type: 'image',
                    src: 'my-img-2',
                },
            ],
        });
        expect(result).toMatchSnapshot();
    });
    test('when actions specified', () => {
        const result = buildNotificationXml({
            body: 'Hello',
            actions: [
                {
                    actionType: 'action',
                    content: 'Some button',
                    arguments: 'someButtonClicked',
                },
                {
                    actionType: 'input',
                    type: 'text',
                    placeHolderContent: 'Reply',
                    id: 'replyId',
                },
                {
                    actionType: 'action',
                    content: 'Send',
                    arguments: 'sendReply',
                    'hint-inputId': 'replyId',
                },
                {
                    actionType: 'input',
                    type: 'selection',
                    id: 'vars',
                    defaultInput: 'yep',
                    selection: [
                        {
                            id: 'yep',
                            content: 'Yes',
                        },
                        {
                            id: 'no',
                            content: 'Nope',
                        },
                    ],
                },
            ],
        });
        expect(result).toMatchSnapshot();
    });
    test('when audio specified', () => {
        const result = buildNotificationXml({
            body: 'Hello',
            audio: {
                src: NotificationSounds.SMS,
                silent: false,
                loop: false,
            },
        });
        expect(result).toMatchSnapshot();
    });
    test('when header specified', () => {
        const result = buildNotificationXml({
            body: 'Hello',
            header: {
                id: 'test',
                title: 'some title',
                arguments: 'def args',
            },
        });
        expect(result).toMatchSnapshot();
    });
});
