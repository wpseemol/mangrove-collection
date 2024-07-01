export default function capitalizeWord(str) {
    if (!str) {
        return null;
    }
    return str.replace(/\b\w/g, (match) => {
        return match.toUpperCase();
    });
}
