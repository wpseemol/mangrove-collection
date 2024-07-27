export default function capitalizeWord(str) {
    if (!str) {
        return null;
    }
    return str.toLowerCase().replace(/\b\w/g, (match) => {
        return match.toUpperCase();
    });
}
