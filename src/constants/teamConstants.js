export const TEAMS_PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

export const DEFAULT_TEAMS_PER_PAGE = 5;

export const TEAM_STATUS = {
    AVAILABLE: 'available',
    TAKEN: 'taken',
    ALL: ''
};

export const TEAM_STATUS_LABELS = {
    [TEAM_STATUS.AVAILABLE]: 'Available',
    [TEAM_STATUS.TAKEN]: 'Taken',
    [TEAM_STATUS.ALL]: 'All Teams'
};

export const FILTER_LABELS = {
    CONFERENCE: 'Conference',
    AVAILABILITY: 'Availability',
    ALL_CONFERENCES: 'All Conferences',
    ALL_TEAMS: 'All Teams'
};

export const TABLE_COLUMN_WIDTHS = {
    LOGO: 60,
    TEAM_NAME: 280,
    CONFERENCE: 140,
    CURRENT_RECORD: 120,
    CONFERENCE_RECORD: 120,
    STATUS: 100,
    ELO: 80
}; 