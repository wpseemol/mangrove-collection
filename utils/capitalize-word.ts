export default function capitalizeWord(str: string) {
    return str.toLowerCase().replace(/\b\w/g, (match) => {
        return match.toUpperCase();
    });
}
