import { humanizeEnumValue, humanizeParamName } from './humanize';
import { STAT_CATALOG } from './statsCatalog';
import { field } from './fieldHelper';

const YES_NO_OPTIONS = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }];
const PLAY_CALL_VALUES = ['RUN', 'PASS', 'SPIKE', 'KNEEL', 'FIELD_GOAL', 'PAT', 'TWO_POINT', 'KICKOFF_NORMAL', 'KICKOFF_ONSIDE', 'KICKOFF_SQUIB', 'PUNT'];
const POLL_TYPE_VALUES = ['COACHES_POLL', 'PLAYOFF_COMMITTEE'];
const SUBDIVISION_VALUES = ['FCFB', 'FBS', 'FCS', 'FAKE'];
const LIMIT_PRESETS = [5, 10, 25, 50, 100];
export const PAGE_SIZE_PRESETS = [10, 20, 25, 50, 100];

const isIdParam = (name) => /id$/i.test(name);
const isBareIdParam = (name) => name.toLowerCase() === 'id';
const isBareNameParam = (name) => name.toLowerCase() === 'name';
const isSeasonParam = (name) => /season/i.test(name);
const isWeekParam = (name) => /week/i.test(name);
const isTeamParam = (name, path) => /team/i.test(name) || (isBareNameParam(name) && path.includes('/team'));
const isUserParam = (name, path) => /user/i.test(name) || (isBareNameParam(name) && path.includes('/user'));
const isGameParam = (name) => /game/i.test(name) && !/gamemode/i.test(name);
const isOngoingGameIdParam = (name, path) => isBareIdParam(name) && path.endsWith('/game/ongoing');
const isScheduleEntryIdParam = (name, path) => isBareIdParam(name) && path.includes('/schedule');
const isConferenceParam = (name) => ['conference', 'code'].includes(name.toLowerCase());
const isChannelParam = (name) => ['channelid', 'platformid'].includes(name.toLowerCase());
const isEloParam = (name) => ['homeelo', 'awayelo'].includes(name.toLowerCase());
const isNewSignupParam = (name) => name.toLowerCase() === 'newsignupid';
const isStatNameParam = (name) => name.toLowerCase() === 'statname';
const isLimitParam = (name) => name.toLowerCase() === 'limit';
const isScopeValueParam = (name) => name.toLowerCase() === 'scopevalue';
const isWriteupPlayCallParam = (name) => name.toLowerCase() === 'playcall';
const isPollTypeParam = (name) => name.toLowerCase() === 'polltype';
const isSubdivisionParam = (name) => name.toLowerCase() === 'subdivision';
const isScenarioParam = (name) => name.toLowerCase() === 'scenario';
const isPageableParam = (param) => param.name.toLowerCase() === 'pageable' || param.schema?.$ref?.endsWith('/Pageable');

const PAGEABLE_SORT_FIELDS_BY_SUFFIX = {
    '/season-stats': ['seasonNumber', 'wins', 'losses', 'team'],
    '/season-stats/postseason': ['seasonNumber', 'wins', 'losses', 'team'],
    '/records': ['seasonNumber', 'week', 'recordValue'],
    '/playbook-stats': ['seasonNumber', 'totalGames'],
    '/playbook-stats/postseason': ['seasonNumber', 'totalGames'],
    '/league-stats': ['seasonNumber', 'totalGames'],
    '/league-stats/postseason': ['seasonNumber', 'totalGames'],
    '/conference-stats': ['seasonNumber', 'conference', 'totalGames'],
    '/conference-stats/postseason': ['seasonNumber', 'conference', 'totalGames'],
};
const NO_PAGEABLE_SORT_SUFFIXES = ['/game', '/scorebug/filtered'];

const sortFieldsForPath = (path) => {
    if (NO_PAGEABLE_SORT_SUFFIXES.some((suffix) => path.endsWith(suffix))) return null;
    const suffix = Object.keys(PAGEABLE_SORT_FIELDS_BY_SUFFIX).find((key) => path.endsWith(key));
    return suffix ? PAGEABLE_SORT_FIELDS_BY_SUFFIX[suffix] : ['id'];
};

const COACH_FIELD_BY_PARAM = {
    discordid: 'discord_id',
    discordtag: 'discord_tag',
    processedby: 'username',
    coach: 'coach_name',
    offensivesubmitter: 'username',
    defensivesubmitter: 'username',
    offensivesubmitterid: 'discord_id',
    defensivesubmitterid: 'discord_id',
};
const COACH_LABEL_BY_PARAM = {
    discordid: 'Coach (Discord)',
    discordtag: 'Coach (Discord Tag)',
    processedby: 'Processed By',
    coach: 'Coach',
    offensivesubmitter: 'Offensive Coach',
    defensivesubmitter: 'Defensive Coach',
    offensivesubmitterid: 'Offensive Coach (Discord)',
    defensivesubmitterid: 'Defensive Coach (Discord)',
};
const isCoachParam = (name) => Object.prototype.hasOwnProperty.call(COACH_FIELD_BY_PARAM, name.toLowerCase());

const gameLabel = (game) => `S${game.season} Wk${game.week}: ${game.away_team} @ ${game.home_team}`;
const userLabel = (user) => (user.coach_name ? `${user.username} (${user.coach_name})` : user.username);

const searchConfig = (options, label) => ({
    uiType: 'search',
    label,
    options,
    resolve: (typed) => options.find((option) => option.label === typed)?.value ?? typed,
});

export const paramConfig = (param, lookups, siblingValues, operationPath) => {
    const name = param.name;

    if (isPageableParam(param)) {
        const sortFields = sortFieldsForPath(operationPath);
        return {
            uiType: 'pageable',
            label: 'Pagination',
            sortFieldOptions: sortFields ? sortFields.map((value) => ({ value, label: humanizeParamName(value) })) : null,
        };
    }

    if (param.schema?.enum) {
        return { uiType: 'select', options: param.schema.enum.map((value) => ({ value, label: humanizeEnumValue(value) })) };
    }

    if (param.schema?.type === 'boolean') {
        return { uiType: 'select', options: YES_NO_OPTIONS };
    }

    if (param.schema?.type === 'array' && param.schema.items?.enum) {
        return { uiType: 'multiselect', options: param.schema.items.enum.map((value) => ({ value, label: humanizeEnumValue(value) })) };
    }

    if (isLimitParam(name)) {
        return { uiType: 'select', options: LIMIT_PRESETS.map((value) => ({ value, label: String(value) })) };
    }

    if (isSeasonParam(name)) {
        return { uiType: 'select', options: lookups.seasons.map((number) => ({ value: number, label: `Season ${number}` })) };
    }

    if (isWeekParam(name)) {
        const selectedSeason = siblingValues.season ?? siblingValues.seasonNumber;
        const isCurrentSeason = selectedSeason == null || Number(selectedSeason) === lookups.currentSeasonNumber;
        const max = (isCurrentSeason ? lookups.currentWeekNumber : null) || 18;
        const weeks = Array.from({ length: max }, (_, index) => index + 1);
        return { uiType: 'select', options: weeks.map((week) => ({ value: week, label: `Week ${week}` })) };
    }

    if (isConferenceParam(name)) {
        return { uiType: 'select', label: 'Conference', options: lookups.conferences.map((conference) => ({ value: conference.code, label: conference.label })) };
    }

    if (isWriteupPlayCallParam(name)) {
        return { uiType: 'select', options: PLAY_CALL_VALUES.map((value) => ({ value, label: humanizeEnumValue(value) })) };
    }

    if (isPollTypeParam(name)) {
        return { uiType: 'select', label: 'Poll Type', options: POLL_TYPE_VALUES.map((value) => ({ value, label: humanizeEnumValue(value) })) };
    }

    if (isSubdivisionParam(name)) {
        return { uiType: 'select', label: 'Subdivision', options: SUBDIVISION_VALUES.map((value) => ({ value, label: humanizeEnumValue(value) })) };
    }

    if (isScenarioParam(name)) {
        const options = lookups.scenarios.map((scenario) => ({ value: scenario, label: scenario }));
        return searchConfig(options, 'Scenario');
    }

    if (isStatNameParam(name)) {
        const options = STAT_CATALOG.map((stat) => ({ value: stat.key, label: stat.label }));
        return searchConfig(options, 'Stat');
    }

    if (isScopeValueParam(name)) {
        const scope = (siblingValues.recordScope || '').toUpperCase();
        if (scope === 'CONFERENCE') {
            return { uiType: 'select', label: 'Conference', options: lookups.conferences.map((conference) => ({ value: conference.code, label: conference.label })) };
        }
        if (scope === 'TEAM') {
            const teams = [...lookups.rawTeams].sort((a, b) => a.name.localeCompare(b.name));
            return searchConfig(teams.map((team) => ({ value: team.name, label: team.name })), 'Team');
        }
        return { uiType: 'text', label: 'Scope Value (not needed for League scope)' };
    }

    if (isEloParam(name)) {
        const options = lookups.rawTeams
            .filter((team) => team.current_elo != null)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((team) => ({ value: team.current_elo, label: `${team.name} (${team.current_elo})` }));
        return searchConfig(options, name.toLowerCase() === 'homeelo' ? 'Home Team ELO' : 'Away Team ELO');
    }

    if (isChannelParam(name)) {
        const options = lookups.ongoingGames.flatMap((game) => [
            { value: game.home_platform_id, label: `${gameLabel(game)} (Home channel)` },
            { value: game.away_platform_id, label: `${gameLabel(game)} (Away channel)` },
        ].filter((option) => option.value != null));
        return searchConfig(options, 'Game Channel');
    }

    if (isNewSignupParam(name)) {
        const options = lookups.newSignups.map((signup) => ({ value: signup.id, label: `${signup.coach_name || signup.username}` }));
        return searchConfig(options, 'New Signup');
    }

    if (isCoachParam(name)) {
        const key = name.toLowerCase();
        const fieldName = COACH_FIELD_BY_PARAM[key];
        const options = lookups.users
            .filter((user) => user[fieldName])
            .map((user) => ({ value: user[fieldName], label: userLabel(user) }))
            .sort((a, b) => a.label.localeCompare(b.label));
        return searchConfig(options, COACH_LABEL_BY_PARAM[key]);
    }

    if (isTeamParam(name, operationPath)) {
        const teams = [...lookups.rawTeams].sort((a, b) => a.name.localeCompare(b.name));
        const options = isIdParam(name)
            ? teams.map((team) => ({ value: team.id, label: team.name }))
            : teams.map((team) => ({ value: team.name, label: team.name }));
        return searchConfig(options, isBareNameParam(name) ? 'Team' : undefined);
    }

    if (isUserParam(name, operationPath)) {
        const users = [...lookups.users].sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        const options = isIdParam(name)
            ? users.map((user) => ({ value: user.id, label: userLabel(user) }))
            : users.map((user) => ({ value: user.username, label: userLabel(user) }));
        return searchConfig(options, isBareNameParam(name) ? 'Coach' : undefined);
    }

    if (isOngoingGameIdParam(name, operationPath)) {
        const options = lookups.ongoingGames.map((game) => ({ value: game.game_id, label: gameLabel(game) }));
        return searchConfig(options, 'Ongoing Game');
    }

    if (isScheduleEntryIdParam(name, operationPath)) {
        const options = lookups.scheduleEntries.map((entry) => ({
            value: entry.id,
            label: `S${field(entry, 'season', 'season')} Wk${field(entry, 'week', 'week')}: ${field(entry, 'awayTeam', 'away_team')} @ ${field(entry, 'homeTeam', 'home_team')} (#${entry.id})`,
        }));
        return searchConfig(options, 'Schedule Entry');
    }

    if (isGameParam(name)) {
        const options = lookups.games.map((game) => ({ value: game.game_id, label: gameLabel(game) }));
        return searchConfig(options);
    }

    return { uiType: 'text' };
};
