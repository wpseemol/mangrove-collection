// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait = 10
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return (...args: Parameters<T>) => {
        if (timeout !== undefined) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export default debounce;
