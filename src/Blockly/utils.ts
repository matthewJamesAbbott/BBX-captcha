export const getFirstLetter = (value: string): string => {
    if (!value) {
        return '';
    }
    return value.charAt(0);
};

export const wait = function (ms = 3000) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export const isEqual = <T>(a?: T, b?: T) =>
    JSON.stringify(a) === JSON.stringify(b);

const hasClassNames = (element: Element, classNames: string[]): boolean => {
    return classNames.every((name) => element.classList.contains(name));
};

const addClass = (element: Element, className: string): boolean => {
    const classNames = className.split(' ');
    if (hasClassNames(element, classNames)) {
        return false;
    }
    element.classList.add(...classNames);
    return true;
};

const removeClass = (element: Element, className: string): void => {
    const classNames = className.split(' ');
    element.classList.remove(...classNames);
};

const getElement = <T extends HTMLElement>(id: string): T => {
    return document.getElementById(id) as T;
};

const addEventHandlerById = <T extends HTMLElement>(
    elementId: string,
    eventType: 'click',
    listener: (
        this: HTMLElement,
        ev: HTMLElementEventMap[keyof HTMLElementEventMap],
    ) => void,
) => {
    return getElement<T>(elementId)?.addEventListener(eventType, listener);
};

const focusElement = <T extends HTMLElement>(element: T): void => {
    element && element.focus();
};

export const dom = {
    focusElement,
    addEventHandlerById,
    getElement,
    removeClass,
    addClass,
};
