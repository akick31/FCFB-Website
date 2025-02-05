import {getAllOngoingGames, getAllPastGames, getAllPastScrimmageGames, getAllScrimmageGames} from "../../api/gameApi";

export const gameTabConfigs = [
    { label: 'Ongoing Scoreboard', value: 'ongoing', fetch: getAllOngoingGames },
    { label: 'Past Scoreboard', value: 'past', fetch: getAllPastGames },
    { label: 'Scrimmages', value: 'scrimmages', fetch: getAllScrimmageGames },
    { label: 'Past Scrimmages', value: 'past-scrimmages', fetch: getAllPastScrimmageGames }
];