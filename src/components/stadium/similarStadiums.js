const IGNORED_WORDS = new Set(['stadium', 'field', 'park', 'arena', 'the', 'at', 'of', 'and', 'center', 'centre']);

const wordsOf = (name) =>
    name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .split(/[^a-z0-9]+/)
        .filter((word) => word && !IGNORED_WORDS.has(word));

const overlap = (typed, existing) => {
    const typedWords = wordsOf(typed);
    const existingWords = new Set(wordsOf(existing));
    if (!typedWords.length || !existingWords.size) {
        return 0;
    }
    return (
        typedWords.filter((word) => existingWords.has(word)).length / Math.min(typedWords.length, existingWords.size)
    );
};

export const similarStadiums = (typed, stadiums, limit = 3) => {
    const name = typed.trim();
    if (name.length < 3 || stadiums.some((stadium) => stadium.name.toLowerCase() === name.toLowerCase())) {
        return [];
    }
    return stadiums
        .map((stadium) => ({ stadium, score: overlap(name, stadium.name) }))
        .filter(({ score }) => score >= 0.5)
        .sort((a, b) => b.score - a.score || a.stadium.name.localeCompare(b.stadium.name))
        .slice(0, limit)
        .map(({ stadium }) => stadium);
};
