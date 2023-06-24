/// <reference types="react" />
declare module "Typescript/LoadingIndicator/style" {
    export const lineStyle: {
        borderRadius: string;
        height: string;
        marginBottom: string;
        background: string;
        backgroundSize: string;
        animation: string;
        amimationFillMode: string;
    };
}
declare module "Typescript/LoadingIndicator/components/LoadingUserItem" {
    import * as React from 'react';
    export function LoadingUserItem(): React.JSX.Element;
}
declare module "Typescript/LoadingIndicator/components/index" {
    export * from "Typescript/LoadingIndicator/components/LoadingUserItem";
}
declare module "Typescript/LoadingIndicator/LoadingIndicator" {
    import React from 'react';
    import useStyles from 'substyle';
    export function LoadingIndicator({ style, className, classNames, }: useStyles.StylingProps): React.JSX.Element;
}
declare module "Typescript/LoadingIndicator/types" {
    export interface LoadingIndictorProps {
    }
}
declare module "Typescript/LoadingIndicator/index" {
    export * from "Typescript/LoadingIndicator/LoadingIndicator";
    export * from "Typescript/LoadingIndicator/style";
    export * from "Typescript/LoadingIndicator/types";
}
declare module "Typescript/index" {
    export * from "Typescript/LoadingIndicator/index";
}
declare module "Typescript/types/types" {
    import * as React from 'react';
    /**
     * The properties for the @see MentionsInput component.
     */
    export interface MentionsInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onBlur' | 'onKeyDown' | 'onSelect'> {
        /**
         * If set to `true` a regular text input element will be rendered
         * instead of a textarea
         */
        singleLine?: boolean | undefined;
        /**
         * If set to `true` spaces will not interrupt matching suggestions
         */
        allowSpaceInQuery?: boolean | undefined;
        allowSuggestionsAboveCursor?: boolean | undefined;
        forceSuggestionsAboveCursor?: boolean | undefined;
        ignoreAccents?: boolean | undefined;
        value?: string | undefined;
        onChange?: OnChangeHandlerFunc | undefined;
        placeholder?: string | undefined;
        onBlur?: ((event: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLTextAreaElement>, clickedSuggestion: boolean) => void) | undefined;
        onSelect?: ((event: React.UIEvent) => void) | undefined;
        onKeyDown?: ((event: React.KeyboardEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLInputElement>) => void) | undefined;
        children: React.ReactElement<MentionProps> | Array<React.ReactElement<MentionProps>>;
        className?: string | undefined;
        classNames?: any;
        style?: any;
        customSuggestionsContainer?: (children: React.ReactNode) => React.ReactNode | undefined;
        suggestionsPortalHost?: Element | undefined;
        inputRef?: React.Ref<HTMLTextAreaElement> | React.Ref<HTMLInputElement> | undefined;
        /**
         * This label would be exposed to screen readers when suggestion popup appears
         * @default ''
         */
        a11ySuggestionsListLabel?: string | undefined;
    }
    /**
     * Exposes the type for use with the @see MentionsInputComponent.wrappedInstance which is added by react-mentions' use of substyle (https://github.com/jfschwarz/substyle).
     */
    export interface MentionsInputComponentUnrwapped extends React.Component<MentionsInputProps> {
        /**
         * @deprecated since version 2.4.0. Please use @see MentionsInputProps.inputRef
         */
        inputRef?: HTMLInputElement | HTMLTextAreaElement | undefined;
    }
    /**
     * Used with @see React.RefObject<MentionsInputComponent>.
     */
    export interface MentionsInputComponent extends React.Component<MentionsInputProps> {
        wrappedInstance?: MentionsInputComponentUnrwapped | undefined;
    }
    /**
     * Used to reference MentionsInput element in a TSX file.
     */
    export interface MentionsInputClass extends React.ComponentClass<MentionsInputProps> {
    }
    /**
     * Props definition for a mention subelement.
     */
    export interface MentionProps {
        onAdd?: ((id: string | number, display: string) => void) | undefined;
        renderSuggestion?: ((suggestion: SuggestionDataItem, search: string, highlightedDisplay: React.ReactNode, index: number, focused: boolean) => React.ReactNode) | undefined;
        className?: string | undefined;
        markup?: string | undefined;
        displayTransform?: DisplayTransformFunc | undefined;
        trigger: string | RegExp;
        isLoading?: boolean | undefined;
        data: SuggestionDataItem[] | DataFunc;
        style?: any;
        appendSpaceOnAdd?: boolean | undefined;
        regex?: RegExp | undefined;
    }
    /**
     * The shape of a mention.
     */
    export interface MentionItem {
        display: string;
        id: string;
        childIndex: number;
        index: number;
        plainTextIndex: number;
    }
    /**
     * The shape of suggestion items.
     */
    export interface SuggestionDataItem {
        id: string | number;
        display?: string;
    }
    /**
     * Defines the function signature for implementing @see MentionsInputProps.displayTransform
     */
    export type DisplayTransformFunc = (id: string, display: string) => string;
    /**
     * Defines the function signature for implementing @see MentionsInputProps.onChange
     */
    export type OnChangeHandlerFunc = (event: {
        target: {
            value: string;
        };
    }, newValue: string, newPlainTextValue: string, mentions: MentionItem[]) => void;
    /**
     * The function to implement asynchronous loading of suggestions in @see MentionProps.data .
     */
    export type DataFunc = (query: string, callback: (data: SuggestionDataItem[]) => void) => Promise<void> | void | Promise<SuggestionDataItem[]> | SuggestionDataItem[];
}
declare module "Typescript/Mention/Mention" {
    import React from 'react';
    import useStyles from 'substyle';
    import { MentionProps } from "Typescript/types/types";
    export interface ExtendedProps {
        display: string;
    }
    export const Mention: {
        ({ display, style, className, classNames, }: MentionProps & useStyles.StylingProps & ExtendedProps): React.JSX.Element;
        defaultProps: {
            trigger: string;
            markup: string;
            displayTransform: (id?: string, display?: string) => string;
            onAdd: () => any;
            onRemove: () => any;
            renderSuggestion: any;
            isLoading: boolean;
            appendSpaceOnAdd: boolean;
        };
    };
    export default Mention;
}
declare module "Typescript/types/index" {
    export * from "Typescript/types/types";
}
declare module "utils/escapeRegex" {
    const escapeRegex: (str: string) => string;
    export default escapeRegex;
}
declare module "utils/placeholders" {
    const _default: {
        id: string;
        display: string;
    };
    export default _default;
}
declare module "utils/findPositionOfCapturingGroup" {
    const findPositionOfCapturingGroup: (markup: string, parameterName: string) => number;
    export default findPositionOfCapturingGroup;
}
declare module "utils/makeMentionsMarkup" {
    const makeMentionsMarkup: (markup: string, id: string, display: string) => string;
    export default makeMentionsMarkup;
}
declare module "utils/markupToRegex" {
    const markupToRegex: (markup: string) => RegExp;
    export default markupToRegex;
}
declare module "utils/readConfigFromChildren" {
    import { MentionProps } from "Typescript/types/types";
    type MentionChild = React.ReactElement<MentionProps>;
    const readConfigFromChildren: (children: MentionChild[]) => {
        markup: string;
        regex: RegExp;
        displayTransform: (id?: string, display?: string) => string;
    }[];
    export default readConfigFromChildren;
}
declare module "utils/spliceString" {
    const spliceString: (str: string, start: number, end: number, insert: string) => string;
    export default spliceString;
}
