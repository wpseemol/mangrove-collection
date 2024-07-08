export default function titleWordClops(title, showWord = 11) {
    if (!title) {
        return '';
    }

    const titleArrayByWord = title.split(' ');
    const titleCount = titleArrayByWord?.length;

    if (titleArrayByWord?.length <= showWord) {
        return title;
    }

    return titleArrayByWord.slice(0, showWord).join(' ') + '...';
}
