import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { getAllTeams } from '../../api/teamApi';
import { getScheduleBySeasonAndTeam, getConferenceSchedule, getPostseasonSchedule, getScheduleBySeason } from '../../api/scheduleApi';
import { getCurrentSeasonOrLatest, getAllSeasons } from '../../api/seasonApi';
import { getStorageItem } from '../../utils/utils';
import { isRealTeam } from '../../utils/teamDataUtils';
import { CONFERENCE_ORDER } from '../../components/constants/conferences';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import ConferenceTabs from '../../components/team/ConferenceTabs';
import TeamSchedule from '../../components/schedule/TeamSchedule';
import ConferenceGrid from '../../components/schedule/ConferenceGrid';
import PostseasonView from '../../components/schedule/PostseasonView';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const LS_TEAM = 'schedule_selectedTeam';
const LS_CONFERENCE = 'schedule_conference';

const TAB_SLUGS = ['team', 'conference', 'postseason'];
const TAB_FROM_SLUG = { team: 0, conference: 1, postseason: 2 };

const teamToSlug = (name) => name?.toLowerCase().replace(/\s+/g, '_') || '';
const confToSlug = (conf) => conf?.toLowerCase() || '';

const Schedule = () => {
    const { tab, selection, seasonParam } = useParams();
    const navigate = useNavigate();
    useSeo(ROUTE_META['/schedules']);
    const teamsMap = useTeamsMap();

    const tabIndex = TAB_FROM_SLUG[tab] ?? 0;

    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [season, setSeason] = useState(null);
    const [allSeasons, setAllSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [error, setError] = useState('');

    const [postseasonSchedule, setPostseasonSchedule] = useState([]);
    const [postseasonLoading, setPostseasonLoading] = useState(false);

    const [selectedConference, setSelectedConference] = useState(() => getStorageItem('local', LS_CONFERENCE, ''));
    const [allSeasonSchedule, setAllSeasonSchedule] = useState([]);
    const [confLoading, setConfLoading] = useState(false);

    const activeTeams = useMemo(
        () => teams.filter((team) => team.active && isRealTeam(team)).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        [teams],
    );
    const availableConferences = useMemo(() => {
        const present = new Set(teams.filter((team) => team.active).map((team) => team.conference));
        return CONFERENCE_ORDER.filter((conf) => present.has(conf));
    }, [teams]);
    const conferenceTeams = useMemo(
        () => activeTeams.filter((team) => team.conference === selectedConference),
        [activeTeams, selectedConference],
    );

    useEffect(() => {
        if (!tab && !loading) navigate('/schedules/team', { replace: true });
    }, [tab, loading, navigate]);

    useEffect(() => {
        if (selectedConference) localStorage.setItem(LS_CONFERENCE, selectedConference);
    }, [selectedConference]);

    useEffect(() => {
        if (selectedTeam) localStorage.setItem(LS_TEAM, selectedTeam.name);
    }, [selectedTeam]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason, seasonsData] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeasonOrLatest(),
                    getAllSeasons(),
                ]);
                setTeams(teamsData);
                const seasonNumbers = seasonsData.map((entry) => entry.season_number ?? entry.seasonNumber).filter((value) => value != null);
                setAllSeasons(seasonNumbers);

                const rawUrlSeason = tab === 'postseason' ? selection : seasonParam;
                const urlSeason = rawUrlSeason ? parseInt(rawUrlSeason, 10) : null;
                setSeason(urlSeason && seasonNumbers.includes(urlSeason) ? urlSeason : currentSeason);

                const sortedTeams = teamsData.filter((team) => team.active && isRealTeam(team)).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                if (tab === 'team' && selection) {
                    setSelectedTeam(sortedTeams.find((team) => teamToSlug(team.name) === selection) || sortedTeams[0] || null);
                } else {
                    const savedTeam = localStorage.getItem(LS_TEAM);
                    setSelectedTeam(sortedTeams.find((team) => team.name === savedTeam) || sortedTeams[0] || null);
                }

                if (tab === 'conference' && selection) {
                    setSelectedConference(selection.toUpperCase());
                } else if (!localStorage.getItem(LS_CONFERENCE)) {
                    setSelectedConference('SEC');
                }
            } catch (err) {
                console.error('Error initializing schedule page:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!selectedTeam || !season || tabIndex !== 0) return;
        setScheduleLoading(true);
        getScheduleBySeasonAndTeam(season, selectedTeam.name)
            .then((data) => setSchedule((data || []).sort((a, b) => (a.week || 0) - (b.week || 0))))
            .catch(() => setSchedule([]))
            .finally(() => setScheduleLoading(false));
    }, [selectedTeam, season, tabIndex]);

    useEffect(() => {
        if (!season || tabIndex !== 1) return;
        setConfLoading(true);
        Promise.all([getConferenceSchedule(season, selectedConference).catch(() => []), getScheduleBySeason(season).catch(() => [])])
            .then(([, allData]) => setAllSeasonSchedule(allData || []))
            .finally(() => setConfLoading(false));
    }, [season, selectedConference, tabIndex]);

    useEffect(() => {
        if (!season) return;
        setPostseasonLoading(true);
        getPostseasonSchedule(season)
            .then((data) => setPostseasonSchedule(data || []))
            .catch(() => setPostseasonSchedule([]))
            .finally(() => setPostseasonLoading(false));
    }, [season]);

    const hasPostseason = postseasonSchedule.length > 0;
    const tabs = [
        { value: 'team', label: 'Team' },
        { value: 'conference', label: 'Conference' },
        ...(hasPostseason ? [{ value: 'postseason', label: 'Postseason' }] : []),
    ];
    const mode = TAB_SLUGS[tabIndex];

    const goToTab = (nextSlug) => {
        if (nextSlug === 'team') navigate(`/schedules/team${selectedTeam ? `/${teamToSlug(selectedTeam.name)}/${season || ''}` : ''}`);
        else if (nextSlug === 'conference') navigate(`/schedules/conference${selectedConference ? `/${confToSlug(selectedConference)}/${season || ''}` : ''}`);
        else navigate(`/schedules/postseason/${season || ''}`);
    };

    const changeSeason = (nextSeason) => {
        setSeason(nextSeason);
        if (mode === 'team') navigate(`/schedules/team${selectedTeam ? `/${teamToSlug(selectedTeam.name)}/${nextSeason}` : ''}`, { replace: true });
        else if (mode === 'conference') navigate(`/schedules/conference${selectedConference ? `/${confToSlug(selectedConference)}/${nextSeason}` : ''}`, { replace: true });
        else navigate(`/schedules/postseason/${nextSeason}`, { replace: true });
    };

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }

    return (
        <PageWrap>
            <PageHeading eyebrow={season ? `Season ${season}` : null} title="Schedules">
                <SegTabs ariaLabel="Schedule view" value={mode} onChange={goToTab} options={tabs} />
                {allSeasons.length > 0 && (
                    <SelectPill
                        label="Season"
                        value={season ?? ''}
                        onChange={(next) => changeSeason(Number(next))}
                        options={allSeasons.map((option) => ({ value: option, label: `Season ${option}` }))}
                    />
                )}
            </PageHeading>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {mode === 'team' && (
                <>
                    <Box sx={{ mb: '16px' }}>
                        <SelectPill
                            label="Team"
                            value={selectedTeam?.name || ''}
                            onChange={(name) => {
                                const team = activeTeams.find((entry) => entry.name === name) || null;
                                setSelectedTeam(team);
                                if (team) navigate(`/schedules/team/${teamToSlug(team.name)}/${season || ''}`, { replace: true });
                            }}
                            options={activeTeams.map((team) => ({ value: team.name, label: team.name }))}
                        />
                    </Box>
                    <TeamSchedule teamName={selectedTeam?.name} schedule={schedule} season={season} teamsMap={teamsMap} loading={scheduleLoading} />
                </>
            )}

            {mode === 'conference' && (
                <>
                    <Box sx={{ mb: '16px' }}>
                        <ConferenceTabs
                            conferences={availableConferences}
                            value={selectedConference}
                            onChange={(conf) => {
                                setSelectedConference(conf);
                                navigate(`/schedules/conference/${confToSlug(conf)}/${season || ''}`, { replace: true });
                            }}
                        />
                    </Box>
                    <ConferenceGrid conferenceTeams={conferenceTeams} schedule={allSeasonSchedule} teamsMap={teamsMap} loading={confLoading} />
                </>
            )}

            {mode === 'postseason' && (
                <PostseasonView postseasonSchedule={postseasonSchedule} teamsMap={teamsMap} loading={postseasonLoading} />
            )}
        </PageWrap>
    );
};

export default Schedule;
