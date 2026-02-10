import React, { useState, useEffect, useMemo } from 'react';
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
import { getCurrentSeason, getAllSeasons } from '../../api/seasonApi';
import { conferences } from '../../components/constants/conferences';
import TeamScheduleTable from '../../components/schedule/TeamScheduleTable';
import ConferenceScheduleGrid from '../../components/schedule/ConferenceScheduleGrid';
import PlayoffBracket from '../../components/schedule/PlayoffBracket';

// localStorage keys
const LS_TEAM = 'schedule_selectedTeam';
const LS_SEASON = 'schedule_season';
const LS_TAB = 'schedule_tab';
const LS_CONFERENCE = 'schedule_conference';

const Schedule = () => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [season, setSeason] = useState(null);
    const [allSeasons, setAllSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [error, setError] = useState('');
    const [tabIndex, setTabIndex] = useState(() => {
        const saved = localStorage.getItem(LS_TAB);
        return saved != null ? parseInt(saved) : 0;
    });

    // Postseason state
    const [postseasonSchedule, setPostseasonSchedule] = useState([]);
    const [postseasonLoading, setPostseasonLoading] = useState(false);

    // Conference tab state
    const [selectedConference, setSelectedConference] = useState(() => {
        return localStorage.getItem(LS_CONFERENCE) || '';
    });
    const [conferenceSchedule, setConferenceSchedule] = useState([]);
    const [allSeasonSchedule, setAllSeasonSchedule] = useState([]); // Full schedule for OOC display
    const [conferenceTeams, setConferenceTeams] = useState([]);
    const [confLoading, setConfLoading] = useState(false);

    // Build a map of team name -> team data for quick logo lookup
    const teamMap = useMemo(() => {
        const map = {};
        teams.forEach(team => {
            if (team.name) {
                map[team.name] = team;
            }
        });
        return map;
    }, [teams]);

    // Save tab to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(LS_TAB, String(tabIndex));
    }, [tabIndex]);

    // Save conference to localStorage whenever it changes
    useEffect(() => {
        if (selectedConference) {
            localStorage.setItem(LS_CONFERENCE, selectedConference);
        }
    }, [selectedConference]);

    // Save team to localStorage whenever it changes
    useEffect(() => {
        if (selectedTeam) {
            localStorage.setItem(LS_TEAM, selectedTeam.name);
        }
    }, [selectedTeam]);

    // Save season to localStorage whenever it changes
    useEffect(() => {
        if (season != null) {
            localStorage.setItem(LS_SEASON, String(season));
        }
    }, [season]);

    // Load teams, current season, and all seasons on mount
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason, seasonsData] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeason(),
                    getAllSeasons()
                ]);
                setTeams(teamsData);
                const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber);
                setAllSeasons(seasonNumbers);

                // Restore season from localStorage, or default to current
                const savedSeason = localStorage.getItem(LS_SEASON);
                if (savedSeason && seasonNumbers.includes(parseInt(savedSeason))) {
                    setSeason(parseInt(savedSeason));
                } else {
                    setSeason(currentSeason);
                }

                // Restore selected team from localStorage, or default to first alphabetical
                const savedTeam = localStorage.getItem(LS_TEAM);
                const activeTeams = teamsData.filter(t => t.active).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                if (savedTeam) {
                    const found = activeTeams.find(t => t.name === savedTeam);
                    setSelectedTeam(found || activeTeams[0] || null);
                } else {
                    setSelectedTeam(activeTeams[0] || null);
                }

                // Default conference to first alphabetical if not saved
                const savedConf = localStorage.getItem(LS_CONFERENCE);
                if (!savedConf) {
                    const sortedConfs = [...conferences].sort((a, b) => a.label.localeCompare(b.label));
                    setSelectedConference(sortedConfs[0]?.value || 'ACC');
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

    // Filter teams by selected conference (for conference tab)
    useEffect(() => {
        if (teams.length > 0 && selectedConference) {
            const filtered = teams.filter(
                t => t.conference === selectedConference && t.active
            ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setConferenceTeams(filtered);
        }
    }, [teams, selectedConference]);

    // Fetch team schedule when team is selected
    useEffect(() => {
        const fetchSchedule = async () => {
            if (!selectedTeam || !season) return;
            if (tabIndex !== 0) return;
            try {
                setScheduleLoading(true);
                setError('');
                const data = await getScheduleBySeasonAndTeam(season, selectedTeam.name);
                const sorted = (data || []).sort((a, b) => (a.week || 0) - (b.week || 0));
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

    // Fetch conference schedule and full season schedule when conference/season changes and tab is Conference
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

    // Fetch postseason schedule when season changes and playoff tab is active
    useEffect(() => {
        const fetchPostseason = async () => {
            if (!season || tabIndex !== 2) return;
            try {
                setPostseasonLoading(true);
                const data = await getPostseasonSchedule(season);
                setPostseasonSchedule(data || []);
            } catch (err) {
                console.error('Error fetching postseason schedule:', err);
                setPostseasonSchedule([]);
            } finally {
                setPostseasonLoading(false);
            }
        };
        fetchPostseason();
    }, [season, tabIndex]);

    // Also fetch postseason on mount to determine if tab should show
    useEffect(() => {
        const checkPostseason = async () => {
            if (!season) return;
            try {
                const data = await getPostseasonSchedule(season);
                setPostseasonSchedule(data || []);
            } catch {
                setPostseasonSchedule([]);
            }
        };
        if (season) checkPostseason();
    }, [season]);

    // Determine if postseason data exists for the bracket tab
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
                {/* Page Header */}
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

                {/* Season Selector */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <FormControl size="medium" sx={{ minWidth: 140 }}>
                        <InputLabel>Season</InputLabel>
                        <Select
                            value={season || ''}
                            label="Season"
                            onChange={(e) => setSeason(e.target.value)}
                        >
                            {allSeasons.map(s => (
                                <MenuItem key={s} value={s}>Season {s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Tabs: Team Schedule / Conference / Playoff Bracket (conditional) */}
                <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                    <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
                        <Tab label="Team Schedule" />
                        <Tab label="Conference" />
                        {hasPostseason && <Tab label="Playoff Bracket" />}
                    </Tabs>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                )}

                {/* TEAM SCHEDULE TAB */}
                {tabIndex === 0 && (
                    <TeamScheduleTable
                        teams={teams}
                        selectedTeam={selectedTeam}
                        onTeamChange={setSelectedTeam}
                        schedule={schedule}
                        season={season}
                        teamMap={teamMap}
                        loading={scheduleLoading}
                    />
                )}

                {/* CONFERENCE TAB */}
                {tabIndex === 1 && (
                    <ConferenceScheduleGrid
                        selectedConference={selectedConference}
                        onConferenceChange={setSelectedConference}
                        conferenceTeams={conferenceTeams}
                        conferenceSchedule={conferenceSchedule}
                        allSeasonSchedule={allSeasonSchedule}
                        teamMap={teamMap}
                        loading={confLoading}
                    />
                )}

                {/* PLAYOFF BRACKET TAB */}
                {tabIndex === 2 && hasPostseason && (
                    <PlayoffBracket
                        postseasonSchedule={postseasonSchedule}
                        teamMap={teamMap}
                        loading={postseasonLoading}
                    />
                )}
            </Box>
        </Container>
    );
};

export default Schedule;
