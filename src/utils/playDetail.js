export const homeWinChance = (play) => {
    if (play?.win_probability == null) {
        return null;
    }
    return play.possession === 'HOME' ? play.win_probability : 1 - play.win_probability;
};

export const playNeighbors = (plays, playId) => {
    const ordered = [...plays].sort((a, b) => (a.play_number ?? 0) - (b.play_number ?? 0));
    const index = ordered.findIndex((play) => play.play_id === playId);
    return {
        index,
        total: ordered.length,
        previous: index > 0 ? ordered[index - 1] : null,
        next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null,
    };
};

export const playSwing = (play, previous) => {
    const before = previous ? homeWinChance(previous) : null;
    const after = homeWinChance(play);
    return { before, after, change: before != null && after != null ? after - before : null };
};

export const formatDuration = (seconds) => {
    if (seconds == null) {
        return '-';
    }
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    const parts = [
        days && `${days}d`,
        hours && `${hours}h`,
        minutes && `${minutes}m`,
        (rest || seconds === 0) && `${rest}s`,
    ];
    return parts.filter(Boolean).slice(0, 2).join(' ');
};

export const enumLabel = (value) => {
    if (value == null || value === '') {
        return '-';
    }
    const text = String(value).replace(/_/g, ' ').toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const percent = (value) => (value == null ? '-' : `${Math.round(value * 100)}%`);
