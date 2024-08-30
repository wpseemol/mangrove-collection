function debounce<T extends (...args: any[]) => any>(func: T, wait = 10) {
    let timeout: ReturnType<typeof setTimeout> | null;

    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        const context = this;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

export default debounce;
