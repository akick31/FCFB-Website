import { getAllOngoingGames,
    getAllPastGames,
    getAllScrimmageGames,
    getAllPastScrimmageGames
} from '../../api/gameApi';

export const fetchGames = async (viewType) => {
    try {
        let games = [];

        switch (viewType) {
            case 'ongoing':
                games = await getAllOngoingGames();
                break;
            case 'past':
                games = await getAllPastGames();
                break;
            case 'scrimmage':
                games = await getAllScrimmageGames();
                break;
            case 'past-scrimmage':
                games = await getAllPastScrimmageGames();
                break;
            default:
                games = await getAllOngoingGames();
                break;
        }

        return games.data;
    } catch (error) {
        console.error(`Failed to fetch ${viewType} games:`, error);
        throw error;
    }
};