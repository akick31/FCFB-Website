import { useState, useEffect, useRef } from 'react';
import { createScheduleEntry, getBowl } from '../api/scheduleApi';
import { uploadPostseasonLogo } from '../api/uploadApi';
import { getConference } from './useConferencesMap';
import { resolveLogoUrl } from '../utils/logoUrl';
import { POSTSEASON_GAME_TYPES } from '../constants/gameEnums';

const discardLogoPreview = (upload) => {
    const reader = upload?.reader;
    if (reader) {
        reader.onloadend = null;
        if (reader.readyState === 1) {
            reader.abort();
        }
    }
};

const useAddGameDialog = ({ season, scheduleLocked, teamMap, onSuccess, showSnackbar }) => {
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
    const dialogScopeRef = useRef(null);
    const bowlRequestRef = useRef(null);
    const logoUploadRef = useRef(null);
    const draftRef = useRef(null);

    useEffect(() => {
        const scope = { active: true, season, onSuccess };
        dialogScopeRef.current = scope;
        setUploadingLogo(false);
        return () => {
            scope.active = false;
            discardLogoPreview(logoUploadRef.current);
        };
    }, [addGameDialogOpen, season, addGameType]);

    useEffect(() => {
        dialogScopeRef.current.onSuccess = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        draftRef.current = { name: addGameBowlName.trim(), venue: addGameVenue, logo: addGameLogo };
    }, [addGameBowlName, addGameVenue, addGameLogo]);

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
        if (addGameType !== 'CONFERENCE_CHAMPIONSHIP' || !addGameHome?.conference) {
            return;
        }
        const venue = getConference(addGameHome.conference)?.championship_venue;
        if (venue) {
            setAddGameVenue(venue);
        }
    }, [addGameType, addGameHome]);

    const isImplicitNeutralSite = POSTSEASON_GAME_TYPES.includes(addGameType);
    const isNeutralSite = isImplicitNeutralSite || addGameNeutralSite;

    const handleBowlNameBlur = () => {
        const name = addGameBowlName.trim();
        if (!name) {
            return;
        }
        const scope = dialogScopeRef.current;
        const request = { name, venue: addGameVenue };
        bowlRequestRef.current = request;
        getBowl(name).then((bowl) => {
            const draft = draftRef.current;
            if (!scope.active || bowlRequestRef.current !== request || draft.name !== name) {
                return;
            }
            if (bowl?.last_venue && draft.venue === request.venue) {
                setAddGameVenue(bowl.last_venue);
            }
            if (bowl?.logo && !draft.logo) {
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
        if (weekNum) {
            setAddGameWeek(weekNum);
        }
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
        const scope = dialogScopeRef.current;
        discardLogoPreview(logoUploadRef.current);
        const upload = { reader: null };
        logoUploadRef.current = upload;
        const isCurrent = () => scope.active && logoUploadRef.current === upload;
        setUploadingLogo(true);
        try {
            const result = await uploadPostseasonLogo(file);
            if (!isCurrent()) {
                return;
            }
            setAddGameLogo(result.url);
            const reader = new FileReader();
            upload.reader = reader;
            reader.onloadend = () => {
                if (isCurrent()) {
                    setAddGameLogoPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            if (isCurrent()) {
                showSnackbar('Failed to upload logo: ' + err.message, 'error');
            }
        } finally {
            if (isCurrent()) {
                setUploadingLogo(false);
            }
        }
    };

    const handleAddGame = async () => {
        if (scheduleLocked && !POSTSEASON_GAME_TYPES.includes(addGameType)) {
            return;
        }
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

        const scope = dialogScopeRef.current;
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
                postseasonGameLogo:
                    addGameType === 'BOWL' ||
                    addGameType === 'PLAYOFFS' ||
                    addGameType === 'CONFERENCE_CHAMPIONSHIP' ||
                    addGameType === 'NATIONAL_CHAMPIONSHIP'
                        ? addGameLogo
                        : null,
                neutralSite: isNeutralSite,
                venue: isNeutralSite ? addGameVenue.trim() : null,
            });
            if (!scope.active) {
                const currentScope = dialogScopeRef.current;
                if (currentScope.active && currentScope.season === season) {
                    currentScope.onSuccess();
                }
                return;
            }
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
            scope.onSuccess();
        } catch (err) {
            if (scope.active) {
                console.error('Error adding game');
                showSnackbar('Failed to add game: ' + err.message, 'error');
            }
        }
    };

    return {
        addGameDialogOpen,
        setAddGameDialogOpen,
        addGameWeek,
        setAddGameWeek,
        addGameHome,
        addGameAway,
        addGameType,
        setAddGameType,
        addGamePlayoffRound,
        setAddGamePlayoffRound,
        addGameHomeSeed,
        setAddGameHomeSeed,
        addGameAwaySeed,
        setAddGameAwaySeed,
        addGameBowlName,
        setAddGameBowlName,
        addGameLogo,
        setAddGameLogo,
        addGameLogoPreview,
        setAddGameLogoPreview,
        uploadingLogo,
        addGameNeutralSite,
        setAddGameNeutralSite,
        addGameVenue,
        setAddGameVenue,
        isImplicitNeutralSite,
        isNeutralSite,
        handleBowlNameBlur,
        handleHomeChange,
        handleAwayChange,
        handleUploadLogo,
        handleAddGame,
        openForCell,
        openManually,
        openForTeam,
        openForPostseason,
    };
};

export default useAddGameDialog;
