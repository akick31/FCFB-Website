import React, { useMemo, useState } from 'react';
import { visuallyHidden } from '@mui/utils';
import { Alert, Box, CircularProgress } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageTabs from '../../components/ui/PageTabs';
import Panel from '../../components/ui/Panel';
import DetailRows from '../../components/ui/DetailRows';
import GameScorebug from '../../components/game/detail/GameScorebug';
import PlayReplay from '../../components/game/play/PlayReplay';
import PlayStepper from '../../components/game/play/PlayStepper';
import {
    clockRows,
    numberRows,
    overviewRows,
    recordRows,
    winProbabilityRows,
} from '../../components/game/play/playRows';
import { buildScoreboardProps } from '../../components/game/detail/scoreboardProps';
import usePlayDetails from '../../hooks/usePlayDetails';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useVenuesMap } from '../../hooks/useVenuesMap';
import { useColorMode } from '../../context/ColorModeContext';
import { useSeo } from '../../hooks/useSeo';
import { describePlay } from '../../utils/formatPlay';
import { playNeighbors, playSwing } from '../../utils/playDetail';
import { secondaryButtonSx } from '../../styles/controls';

const TABS = [
    { value: 'overview', label: 'Overview' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'clock', label: 'Clock & timeouts' },
    { value: 'probability', label: 'Win probability' },
    { value: 'record', label: 'Record' },
];

const PlayDetails = () => {
    const { playId } = useParams();
    const details = usePlayDetails(playId);
    const teamsMap = useTeamsMap();
    const venuesMap = useVenuesMap();
    const { mode } = useColorMode();
    const [tab, setTab] = useState('overview');
    const { play, game, plays = [] } = details;

    const neighbors = useMemo(() => (play ? playNeighbors(plays, play.play_id) : null), [plays, play]);

    useSeo({
        title: game ? `Play ${play.play_number}, ${game.away_team} at ${game.home_team} | FCFB` : 'Play Details | FCFB',
        description: game
            ? `Replay and full details of a play in ${game.away_team} at ${game.home_team}.`
            : 'Play details.',
    });

    if (details.loading) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            </PageWrap>
        );
    }
    if (details.error) {
        return (
            <PageWrap>
                <Alert severity="error">{details.error}</Alert>
            </PageWrap>
        );
    }

    const awayMark =
        teamsMap[game.away_team] || (details.awayTeam ? toEntry(details.awayTeam) : { name: game.away_team });
    const homeMark =
        teamsMap[game.home_team] || (details.homeTeam ? toEntry(details.homeTeam) : { name: game.home_team });
    const scoreboard = buildScoreboardProps({
        game,
        awayMark,
        homeMark,
        homeTeam: details.homeTeam,
        awayStats: details.awayStats,
        homeStats: details.homeStats,
        venuesMap,
        mode,
    });
    const homeOffense = play.possession === 'HOME';
    const context = {
        play,
        previous: neighbors.previous,
        offense: homeOffense ? game.home_team : game.away_team,
        defense: homeOffense ? game.away_team : game.home_team,
        homeAbbr: homeMark.abbreviation,
        awayAbbr: awayMark.abbreviation,
        homeName: game.home_team,
        awayName: game.away_team,
        swing: playSwing(play, neighbors.previous),
        index: neighbors.index,
        total: neighbors.total,
    };
    const description = describePlay(play, { homeName: game.home_team, awayName: game.away_team });
    const rowsByTab = {
        numbers: numberRows(play),
        clock: clockRows(context),
        probability: winProbabilityRows(context),
        record: recordRows(context),
    };

    return (
        <PageWrap>
            <Box component="h1" sx={visuallyHidden}>
                Play details, {description}
            </Box>
            <GameScorebug {...scoreboard} />
            <Box sx={{ mt: '12px' }}>
                <PageTabs
                    value={tab}
                    onChange={setTab}
                    options={TABS}
                    ariaLabel="Play sections"
                    trailing={
                        <>
                            <PlayStepper
                                previousId={neighbors.previous?.play_id}
                                nextId={neighbors.next?.play_id}
                                label={`Play ${neighbors.index + 1} of ${neighbors.total}`}
                            />
                            <Box component={Link} to={`/game-details/${game.game_id}?tab=plays`} sx={secondaryButtonSx}>
                                Game details
                            </Box>
                        </>
                    }
                />
            </Box>
            {tab === 'overview' ? (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.3fr) minmax(0, 1fr)' },
                        gap: '16px',
                        mt: '16px',
                        alignItems: 'start',
                    }}
                >
                    <PlayReplay key={play.play_id} playId={play.play_id} description={description} />
                    <Panel header={description}>
                        <DetailRows rows={overviewRows(context)} dense />
                    </Panel>
                </Box>
            ) : (
                <Box sx={{ mt: '16px', maxWidth: 640 }}>
                    <Panel header={TABS.find((option) => option.value === tab).label}>
                        <DetailRows rows={rowsByTab[tab]} />
                    </Panel>
                </Box>
            )}
        </PageWrap>
    );
};

export default PlayDetails;
