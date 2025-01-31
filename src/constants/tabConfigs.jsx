import {getAllOngoingGames, getAllPastGames, getAllPastScrimmageGames, getAllScrimmageGames} from "../api/gameApi";

export const gameTabConfigs = [
    { label: 'Ongoing Games', value: 'ongoing', fetch: getAllOngoingGames },
    { label: 'Past Games', value: 'past', fetch: getAllPastGames },
    { label: 'Scrimmages', value: 'scrimmages', fetch: getAllScrimmageGames },
    { label: 'Past Scrimmages', value: 'past-scrimmages', fetch: getAllPastScrimmageGames }
];