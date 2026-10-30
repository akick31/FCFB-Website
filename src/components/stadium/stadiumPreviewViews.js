const SIDE_OF = { 'Left end': 'LEFT', 'Right end': 'RIGHT' };

const boardOn = (side, design) =>
    side === 'LEFT'
        ? Boolean(design.jumbotron_enabled) || design.stadium_backdrop === 'HILL'
        : Boolean(design.right_jumbotron_enabled) || design.right_stadium_backdrop === 'HILL';

export const previewViewFor = (part, design) => {
    const side = part && SIDE_OF[part.section];
    if (!side) {
        return 'BOTH';
    }
    return part.group === 'Scoreboard' && boardOn(side, design) ? `${side}_SCOREBOARD` : side;
};

export const previewTitleFor = (part) => {
    if (!part || !SIDE_OF[part.section]) {
        return 'Both ends';
    }
    return part.group === 'Scoreboard' ? `${part.section} scoreboard` : part.section;
};
