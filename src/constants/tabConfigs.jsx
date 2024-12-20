import {getAllOngoingGames, getAllPastGames, getAllPastScrimmageGames, getAllScrimmageGames} from "../api/gameApi";

export const gameTabConfigs = [
    { label: 'Ongoing Games', value: 'ongoing', fetch: getAllOngoingGames },
    { label: 'Past Games', value: 'past', fetch: getAllPastGames },
    { label: 'Scrimmages', value: 'scrimmage', fetch: getAllScrimmageGames },
    { label: 'Past Scrimmages', value: 'past-scrimmage', fetch: getAllPastScrimmageGames }
];