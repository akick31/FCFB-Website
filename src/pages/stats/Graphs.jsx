import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import { useColorMode } from '../../theme/ColorModeContext';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { getAllTeams } from '../../api/teamApi';
import { getAllSeasons } from '../../api/seasonApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import { seasonHasStarted } from '../../utils/statsCatalog';
import { useSeo } from '../../hooks/useSeo';
import EloGraphTab from '../../components/stats/graphs/EloGraphTab';
import RankingsGraphTab from '../../components/stats/graphs/RankingsGraphTab';
import StatPlotsGraphTab from '../../components/stats/graphs/StatPlotsGraphTab';
import ConferenceStrengthTab from '../../components/stats/graphs/ConferenceStrengthTab';
import PlaybooksGraphTab from '../../components/stats/graphs/PlaybooksGraphTab';

const TABS = [
    { value: 'elo', label: 'ELO' },
    { value: 'rankings', label: 'Rankings' },
    { value: 'plots', label: 'Stat Plots' },
    { value: 'conf', label: 'Conference Strength' },
    { value: 'pb', label: 'Playbooks' },
];
const TAB_VALUES = TABS.map((t) => t.value);

const Graphs = () => {
    useSeo({ title: 'Graphs | FCFB', description: 'Interactive graphs visualizing ELO history, ranking movement, and statistical trends across Fake College Football.' });

    const { tab } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { mode } = useColorMode();
    const teamsMap = useTeamsMap();
    const activeTab = TAB_VALUES.includes(tab) ? tab : 'elo';

    const seasonParam = searchParams.get('season');

    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [season, setSeason] = useState(seasonParam ? Number(seasonParam) : null);
    const [loading, setLoading] = useState(true);

    const changeSeason = (nextSeason) => {
        setSeason(nextSeason);
        const next = new URLSearchParams(searchParams);
        next.set('season', String(nextSeason));
        setSearchParams(next, { replace: true });
    };

    const changeTab = (nextTab) => {
        const next = new URLSearchParams();
        if (season != null) next.set('season', String(season));
        navigate(`/graphs/${nextTab}?${next.toString()}`);
    };

    useEffect(() => {
        if (!tab) navigate({ pathname: '/graphs/elo', search: searchParams.toString() }, { replace: true });
    }, [tab, navigate]);

    useEffect(() => {
        if (season == null || seasonParam) return;
        const next = new URLSearchParams(searchParams);
        next.set('season', String(season));
        setSearchParams(next, { replace: true });
    }, [season, seasonParam]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [allTeams, allSeasons] = await Promise.all([getAllTeams().catch(() => []), getAllSeasons().catch(() => [])]);
                if (!active) return;
                setTeams((allTeams || []).filter((t) => t.active && isRealTeam(t)));
                const started = (allSeasons || []).filter(seasonHasStarted)
                    .map((entry) => entry.season_number ?? entry.seasonNumber)
                    .filter((value) => value != null)
                    .sort((a, b) => b - a);
                setSeasons(started);
                if (season == null) setSeason(started[0] ?? null);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const seasonOptions = useMemo(() => seasons.map((s) => ({ value: String(s), label: `Season ${s}` })), [seasons]);

    const renderTab = () => {
        if (activeTab === 'elo') return <EloGraphTab season={season} teams={teams} teamsMap={teamsMap} mode={mode} />;
        if (activeTab === 'rankings') return <RankingsGraphTab season={season} teams={teams} teamsMap={teamsMap} mode={mode} />;
        if (activeTab === 'plots') return <StatPlotsGraphTab season={season} teams={teams} teamsMap={teamsMap} mode={mode} />;
        if (activeTab === 'conf') return <ConferenceStrengthTab season={season} teams={teams} />;
        return <PlaybooksGraphTab season={season} />;
    };

    return (
        <PageWrap>
            <PageHeading eyebrow="Visual trends" title="Graphs">
                {season != null && (
                    <SelectPill label="Season" value={String(season)} onChange={(value) => changeSeason(Number(value))} options={seasonOptions} sx={{ height: 38 }} />
                )}
            </PageHeading>

            <Box sx={{ mb: 2 }}>
                <SegTabs value={activeTab} onChange={changeTab} options={TABS} ariaLabel="Graph type" />
            </Box>

            {loading || season == null ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : (
                renderTab()
            )}
        </PageWrap>
    );
};

export default Graphs;
