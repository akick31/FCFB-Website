import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
} from '@mui/material';
import { getAllTeams } from '../../api/teamApi';
import { getScheduleBySeasonAndTeam, getConferenceSchedule, getPostseasonSchedule, getScheduleBySeason } from '../../api/scheduleApi';
import { getCurrentSeasonOrLatest, getAllSeasons } from '../../api/seasonApi';
import { getAllOngoingGames } from '../../api/gameApi';
import { getStorageItem } from '../../utils/utils';
import { conferences } from '../../components/constants/conferences';
import TeamScheduleTable from '../../components/schedule/TeamScheduleTable';
import ConferenceScheduleGrid from '../../components/schedule/ConferenceScheduleGrid';
import Postseason from '../../components/schedule/Postseason';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const LS_TEAM = 'schedule_selectedTeam';
const LS_SEASON = 'schedule_season';
const LS_CONFERENCE = 'schedule_conference';

const TAB_SLUGS = ['team', 'conference', 'postseason'];
const TAB_FROM_SLUG = { team: 0, conference: 1, postseason: 2 };

const teamToSlug = (name) => name?.toLowerCase().replace(/\s+/g, '_') || '';
const confToSlug = (conf) => conf?.toLowerCase() || '';

const Schedule = () => {
    const { tab, selection, seasonParam } = useParams();
    const navigate = useNavigate();
    useSeo(ROUTE_META['/schedules']);

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
    const [ongoingGames, setOngoingGames] = useState([]);

    const [selectedConference, setSelectedConference] = useState(() => getStorageItem('local', LS_CONFERENCE, ''));
    const [conferenceSchedule, setConferenceSchedule] = useState([]);
    const [allSeasonSchedule, setAllSeasonSchedule] = useState([]);
    const [conferenceTeams, setConferenceTeams] = useState([]);
    const [confLoading, setConfLoading] = useState(false);

    const teamMap = useMemo(() => {
        const map = {};
        teams.forEach(team => {
            if (team.name) {
                map[team.name] = team;
            }
        });
        return map;
    }, [teams]);

    useEffect(() => {
        if (!tab && !loading) {
            navigate('/schedules/team', { replace: true });
        }
    }, [tab, loading, navigate]);

    useEffect(() => {
        if (!teams.length) return;
        const activeTeams = teams.filter(t => t.active);
        if (tab === 'team' && selection) {
            const found = activeTeams.find(t => teamToSlug(t.name) === selection);
            if (found) setSelectedTeam(found);
        } else if (tab === 'conference' && selection) {
            setSelectedConference(selection.toUpperCase());
        }
    // eslint-disable-next-line
    }, [tab, selection, teams]);

    useEffect(() => {
        if (selectedConference) {
            localStorage.setItem(LS_CONFERENCE, selectedConference);
        }
    }, [selectedConference]);

    useEffect(() => {
        if (selectedTeam) {
            localStorage.setItem(LS_TEAM, selectedTeam.name);
        }
    }, [selectedTeam]);

    useEffect(() => {
        if (season != null) {
            localStorage.setItem(LS_SEASON, String(season));
        }
    }, [season]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason, seasonsData] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeasonOrLatest(),
                    getAllSeasons()
                ]);
                setTeams(teamsData);
                const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber);
                setAllSeasons(seasonNumbers);

                const rawUrlSeason = tab === 'postseason' ? selection : seasonParam;
                const urlSeason = rawUrlSeason ? parseInt(rawUrlSeason) : null;
                if (urlSeason && !isNaN(urlSeason) && seasonNumbers.includes(urlSeason)) {
                    setSeason(urlSeason);
                } else {
                    setSeason(currentSeason);
                }

                const activeTeams = teamsData.filter(t => t.active).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                if (tab === 'team' && selection) {
                    const found = activeTeams.find(t => teamToSlug(t.name) === selection);
                    setSelectedTeam(found || activeTeams[0] || null);
                } else {
                    const savedTeam = localStorage.getItem(LS_TEAM);
                    if (savedTeam) {
                        const found = activeTeams.find(t => t.name === savedTeam);
                        setSelectedTeam(found || activeTeams[0] || null);
                    } else {
                        setSelectedTeam(activeTeams[0] || null);
                    }
                }

                if (tab === 'conference' && selection) {
                    setSelectedConference(selection.toUpperCase());
                } else {
                    const savedConf = localStorage.getItem(LS_CONFERENCE);
                    if (!savedConf) {
                        const sortedConfs = [...conferences].sort((a, b) => a.label.localeCompare(b.label));
                        setSelectedConference(sortedConfs[0]?.value || 'ACC');
                    }
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
        if (teams.length > 0 && selectedConference) {
            const filtered = teams.filter(
                t => t.conference === selectedConference && t.active
            ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setConferenceTeams(filtered);
        }
    }, [teams, selectedConference]);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedTeam || !season) return;
            if (tabIndex !== 0) return;
            try {
                setScheduleLoading(true);
                setError('');
                const teamSchedule = await getScheduleBySeasonAndTeam(season, selectedTeam.name);
                const sorted = (teamSchedule || []).sort((a, b) => (a.week || 0) - (b.week || 0));
                setSchedule(sorted);
            } catch (err) {
                console.error('Error fetching schedule:', err);
                setSchedule([]);
                if (!err.message?.includes('not found')) {
                    setError('Failed to load schedule. Please try again.');
                }
            } finally {
                setScheduleLoading(false);
            }
        };
        fetchSchedule();
    }, [selectedTeam, season, tabIndex]);

    useEffect(() => {
        const fetchConfSchedule = async () => {
            if (!season || !selectedConference || tabIndex !== 1) return;
            try {
                setConfLoading(true);
                const [confData, allData] = await Promise.all([
                    getConferenceSchedule(season, selectedConference),
                    getScheduleBySeason(season)
                ]);
                setConferenceSchedule(confData || []);
                setAllSeasonSchedule(allData || []);
            } catch (err) {
                console.error('Error fetching conference schedule:', err);
                setConferenceSchedule([]);
                setAllSeasonSchedule([]);
            } finally {
                setConfLoading(false);
            }
        };
        fetchConfSchedule();
    }, [season, selectedConference, tabIndex]);

    useEffect(() => {
        const fetchPostseason = async () => {
            if (!season || tabIndex !== 2) return;
            try {
                setPostseasonLoading(true);
                const postseason = await getPostseasonSchedule(season);
                setPostseasonSchedule(postseason || []);
            } catch (err) {
                console.error('Error fetching postseason schedule:', err);
                setPostseasonSchedule([]);
            } finally {
                setPostseasonLoading(false);
            }
        };
        fetchPostseason();
    }, [season, tabIndex]);

    useEffect(() => {
        const checkPostseason = async () => {
            if (!season) return;
            try {
                const postseason = await getPostseasonSchedule(season);
                setPostseasonSchedule(postseason || []);
            } catch {
                setPostseasonSchedule([]);
            }
        };
        if (season) checkPostseason();
    }, [season]);

    useEffect(() => {
        const fetchOngoing = async () => {
            try {
                const res = await getAllOngoingGames();
                setOngoingGames(res?.data || []);
            } catch {
                setOngoingGames([]);
            }
        };
        fetchOngoing();
    }, []);

    const hasPostseason = postseasonSchedule.length > 0;

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ pt: { xs: 8, md: 10 }, pb: { xs: 4, md: 6 } }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}
                    >
                        Schedules
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
                        Season {season}
                    </Typography>
                </Box>

                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <FormControl size="medium" sx={{ minWidth: 140 }}>
                        <InputLabel>Season</InputLabel>
                        <Select
                            value={season || ''}
                            label="Season"
                            onChange={(e) => {
                                const newSeason = e.target.value;
                                setSeason(newSeason);
                                const slug = TAB_SLUGS[tabIndex] || 'team';
                                if (slug === 'team') {
                                    navigate(`/schedules/team${selectedTeam ? '/' + teamToSlug(selectedTeam.name) + '/' + newSeason : ''}`, { replace: true });
                                } else if (slug === 'conference') {
                                    navigate(`/schedules/conference${selectedConference ? '/' + confToSlug(selectedConference) + '/' + newSeason : ''}`, { replace: true });
                                } else {
                                    navigate(`/schedules/postseason/${newSeason}`, { replace: true });
                                }
                            }}
                        >
                            {allSeasons.map(s => (
                                <MenuItem key={s} value={s}>Season {s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                    <Tabs value={tabIndex} onChange={(_, v) => {
                        const slug = TAB_SLUGS[v];
                        const s = season || '';
                        if (slug === 'team') {
                            navigate(`/schedules/team${selectedTeam ? '/' + teamToSlug(selectedTeam.name) + '/' + s : ''}`);
                        } else if (slug === 'conference') {
                            navigate(`/schedules/conference${selectedConference ? '/' + confToSlug(selectedConference) + '/' + s : ''}`);
                        } else {
                            navigate(`/schedules/postseason/${s}`);
                        }
                    }}>
                        <Tab label="Team Schedule" />
                        <Tab label="Conference" />
                        {hasPostseason && <Tab label="Postseason" />}
                    </Tabs>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                )}

                {tabIndex === 0 && (
                    <TeamScheduleTable
                        teams={teams}
                        selectedTeam={selectedTeam}
                        onTeamChange={(team) => {
                            setSelectedTeam(team);
                            navigate(`/schedules/team${team ? '/' + teamToSlug(team.name) + '/' + (season || '') : ''}`, { replace: true });
                        }}
                        schedule={schedule}
                        season={season}
                        teamMap={teamMap}
                        loading={scheduleLoading}
                    />
                )}

                {tabIndex === 1 && (
                    <ConferenceScheduleGrid
                        selectedConference={selectedConference}
                        onConferenceChange={(conf) => {
                            setSelectedConference(conf);
                            navigate(`/schedules/conference/${confToSlug(conf)}/${season || ''}`, { replace: true });
                        }}
                        conferenceTeams={conferenceTeams}
                        conferenceSchedule={conferenceSchedule}
                        allSeasonSchedule={allSeasonSchedule}
                        teamMap={teamMap}
                        loading={confLoading}
                    />
                )}

                {tabIndex === 2 && hasPostseason && (
                    <Postseason
                        postseasonSchedule={postseasonSchedule}
                        ongoingGames={ongoingGames}
                        teamMap={teamMap}
                        loading={postseasonLoading}
                    />
                )}
            </Box>
        </Container>
    );
};

export default Schedule;
