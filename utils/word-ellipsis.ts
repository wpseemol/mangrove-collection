export default function wordEllipsis(text: string, showLetter = 50): string {
    if (!text) {
        return '';
    }

    const titleArrayByWord = text.split('');
    const titleCount = titleArrayByWord?.length;

    if (titleArrayByWord?.length <= showLetter) {
        return text;
    }

    return titleArrayByWord.slice(0, showLetter).join('').trim() + '...';
}
