import { useState, useEffect } from 'react';
import { createScheduleEntry, getBowl } from '../api/scheduleApi';
import { uploadPostseasonLogo } from '../api/uploadApi';
import { getConference } from '../components/constants/conferences';
import { resolveLogoUrl } from '../utils/logoUrl';

const useAddGameDialog = ({ season, teamMap, onSuccess, showSnackbar }) => {
    const [addGameDialogOpen, setAddGameDialogOpen] = useState(false);
    const [addGameWeek, setAddGameWeek] = useState(1);
    const [addGameHome, setAddGameHome] = useState(null);
    const [addGameAway, setAddGameAway] = useState(null);
    const [addGameAnchorTeam, setAddGameAnchorTeam] = useState(null);
    const [addGameType, setAddGameType] = useState('CONFERENCE_GAME');
    const [addGamePlayoffRound, setAddGamePlayoffRound] = useState(null);
    const [addGameHomeSeed, setAddGameHomeSeed] = useState(null);
    const [addGameAwaySeed, setAddGameAwaySeed] = useState(null);
    const [addGameBowlName, setAddGameBowlName] = useState('');
    const [addGameLogo, setAddGameLogo] = useState(null);
    const [addGameLogoPreview, setAddGameLogoPreview] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [addGameNeutralSite, setAddGameNeutralSite] = useState(false);
    const [addGameVenue, setAddGameVenue] = useState('');

    useEffect(() => {
        if (addGameDialogOpen) {
            if (addGameType === 'BOWL') {
                setAddGameWeek(14);
                setAddGameBowlName('');
            } else if (addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') {
                if (addGamePlayoffRound) {
                    setAddGameWeek(13 + addGamePlayoffRound);
                }
            }
        }
    }, [addGameDialogOpen, addGameType, addGamePlayoffRound]);

    useEffect(() => {
        if (addGameDialogOpen) {
            setAddGameNeutralSite(false);
            setAddGameVenue('');
        }
    }, [addGameDialogOpen]);

    useEffect(() => {
        if (addGameType !== 'CONFERENCE_CHAMPIONSHIP' || !addGameHome?.conference) return;
        const venue = getConference(addGameHome.conference)?.championship_venue;
        if (venue) setAddGameVenue(venue);
    }, [addGameType, addGameHome]);

    const isImplicitNeutralSite = addGameType === 'BOWL' || addGameType === 'PLAYOFFS' || addGameType === 'CONFERENCE_CHAMPIONSHIP' || addGameType === 'NATIONAL_CHAMPIONSHIP';
    const isNeutralSite = isImplicitNeutralSite || addGameNeutralSite;

    const handleBowlNameBlur = () => {
        const name = addGameBowlName.trim();
        if (!name) return;
        getBowl(name).then((bowl) => {
            if (bowl?.last_venue) setAddGameVenue(bowl.last_venue);
            if (bowl?.logo && !addGameLogo) {
                setAddGameLogo(bowl.logo);
                setAddGameLogoPreview(resolveLogoUrl(bowl.logo));
            }
        });
    };

    const handleHomeChange = (team) => {
        setAddGameHome(team);
        if (addGameAnchorTeam && team?.name !== addGameAnchorTeam && addGameAway?.name !== addGameAnchorTeam) {
            setAddGameAway(teamMap[addGameAnchorTeam] || { name: addGameAnchorTeam });
        }
    };

    const handleAwayChange = (team) => {
        setAddGameAway(team);
        if (addGameAnchorTeam && team?.name !== addGameAnchorTeam && addGameHome?.name !== addGameAnchorTeam) {
            setAddGameHome(teamMap[addGameAnchorTeam] || { name: addGameAnchorTeam });
        }
    };

    const openForCell = (teamName, weekNum, gameType) => {
        setAddGameType(gameType);
        setAddGameWeek(weekNum);
        setAddGameHome(teamMap[teamName] || { name: teamName });
        setAddGameAway(null);
        setAddGameAnchorTeam(teamName);
        setAddGameDialogOpen(true);
    };

    const openManually = (gameType) => {
        setAddGameType(gameType);
        setAddGameAnchorTeam(null);
        setAddGameDialogOpen(true);
    };

    const openForTeam = (team, weekNum) => {
        setAddGameType('CONFERENCE_GAME');
        setAddGameHome(team);
        setAddGameAway(null);
        if (weekNum) setAddGameWeek(weekNum);
        setAddGameAnchorTeam(team?.name || null);
        setAddGameDialogOpen(true);
    };

    const openForPostseason = (gameType, week) => {
        setAddGameType(gameType);
        setAddGameAnchorTeam(null);
        if (gameType === 'BOWL') {
            setAddGameWeek(14);
        } else if (week) {
            setAddGameWeek(week);
        }
        setAddGameDialogOpen(true);
    };

    const handleUploadLogo = async (file) => {
        setUploadingLogo(true);
        try {
            const result = await uploadPostseasonLogo(file);
            setAddGameLogo(result.url);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAddGameLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            showSnackbar('Failed to upload logo: ' + err.message, 'error');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleAddGame = async () => {
        if (!addGameHome || !addGameAway) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }

        let finalWeek = addGameWeek;
        const finalSubdivision = 'FCFB';
        let finalGameType = addGameType;

        if (addGameType === 'BOWL') {
            if (!addGameBowlName || addGameBowlName.trim() === '') {
                showSnackbar('Bowl game name is required', 'error');
                return;
            }
            finalWeek = 14;
            finalGameType = 'BOWL';
        } else if (addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') {
            if (!addGamePlayoffRound) {
                showSnackbar('Please enter a playoff round', 'error');
                return;
            }
            finalWeek = 13 + addGamePlayoffRound;
        }

        if (!finalWeek) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }

        if (isNeutralSite && !addGameVenue.trim()) {
            showSnackbar('Venue is required for a neutral site game', 'error');
            return;
        }

        try {
            await createScheduleEntry({
                season,
                week: finalWeek,
                subdivision: finalSubdivision,
                homeTeam: addGameHome.name || addGameHome,
                awayTeam: addGameAway.name || addGameAway,
                gameType: finalGameType,
                playoffRound: addGamePlayoffRound,
                playoffHomeSeed: addGameHomeSeed,
                playoffAwaySeed: addGameAwaySeed,
                postseasonGameName: addGameType === 'BOWL' ? addGameBowlName : null,
                postseasonGameLogo: (addGameType === 'BOWL' || addGameType === 'PLAYOFFS' || addGameType === 'CONFERENCE_CHAMPIONSHIP' || addGameType === 'NATIONAL_CHAMPIONSHIP') ? addGameLogo : null,
                neutralSite: isNeutralSite,
                venue: isNeutralSite ? addGameVenue.trim() : null,
            });
            showSnackbar('Game added successfully');
            setAddGameDialogOpen(false);
            setAddGameHome(null);
            setAddGameAway(null);
            setAddGamePlayoffRound(null);
            setAddGameHomeSeed(null);
            setAddGameAwaySeed(null);
            setAddGameBowlName('');
            setAddGameLogo(null);
            setAddGameLogoPreview(null);
            onSuccess();
        } catch (err) {
            console.error('Error adding game:', err);
            showSnackbar('Failed to add game: ' + err.message, 'error');
        }
    };

    return {
        addGameDialogOpen, setAddGameDialogOpen,
        addGameWeek, setAddGameWeek,
        addGameHome, addGameAway,
        addGameType, setAddGameType,
        addGamePlayoffRound, setAddGamePlayoffRound,
        addGameHomeSeed, setAddGameHomeSeed,
        addGameAwaySeed, setAddGameAwaySeed,
        addGameBowlName, setAddGameBowlName,
        addGameLogo, setAddGameLogo,
        addGameLogoPreview, setAddGameLogoPreview,
        uploadingLogo,
        addGameNeutralSite, setAddGameNeutralSite,
        addGameVenue, setAddGameVenue,
        isImplicitNeutralSite, isNeutralSite,
        handleBowlNameBlur,
        handleHomeChange, handleAwayChange,
        handleUploadLogo,
        handleAddGame,
        openForCell, openManually, openForTeam, openForPostseason,
    };
};

export default useAddGameDialog;
