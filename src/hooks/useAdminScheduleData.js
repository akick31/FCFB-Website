import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
    getScheduleBySeason,
    getConferenceSchedule,
    getConferenceRules,
    getScheduleBySeasonAndTeam,
    getPostseasonSchedule,
} from '../api/scheduleApi';

const DEFAULT_CONFERENCE_GAMES = 9;

const useAdminScheduleData = ({ season, selectedConference, selectedTeam, tab }) => {
    const [allSeasonSchedule, setAllSeasonSchedule] = useState([]);
    const [conferenceSchedule, setConferenceSchedule] = useState([]);
    const [confLoading, setConfLoading] = useState(false);
    const [teamFullSchedule, setTeamFullSchedule] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [postseasonSchedule, setPostseasonSchedule] = useState([]);
    const [postseasonLoading, setPostseasonLoading] = useState(false);
    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);
    const [protectedRivalries, setProtectedRivalries] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const selectionRef = useRef({ season, selectedConference, selectedTeam, tab });
    const requestsRef = useRef({});
    const mountedRef = useRef(false);

    useLayoutEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            Object.values(requestsRef.current).forEach((request) => request.abort());
        };
    }, []);

    useLayoutEffect(() => {
        const previous = selectionRef.current;
        if (previous.season !== season) {
            Object.values(requestsRef.current).forEach((request) => request.abort());
        }
        if (previous.selectedConference !== selectedConference) {
            requestsRef.current.conference?.abort();
            requestsRef.current.rules?.abort();
        }
        if (previous.selectedTeam !== selectedTeam) {
            requestsRef.current.team?.abort();
        }
        if (previous.tab !== tab) {
            requestsRef.current.conference?.abort();
            requestsRef.current.rules?.abort();
            requestsRef.current.team?.abort();
            requestsRef.current.postseason?.abort();
        }
        selectionRef.current = { season, selectedConference, selectedTeam, tab };
    }, [season, selectedConference, selectedTeam, tab]);

    const loadResource = useCallback(async (resource, load, onLoaded, onFailed, onFinished) => {
        if (!mountedRef.current) {
            return;
        }
        requestsRef.current[resource]?.abort();
        const request = new AbortController();
        requestsRef.current[resource] = request;
        try {
            const data = await load();
            if (!request.signal.aborted) {
                onLoaded(data);
            }
        } catch (error) {
            if (!request.signal.aborted) {
                onFailed(error);
            }
        } finally {
            if (!request.signal.aborted) {
                onFinished?.();
            }
        }
    }, []);

    const refreshAllSeasonSchedule = useCallback(
        (clearOnError = false) => {
            const currentSeason = selectionRef.current.season;
            if (!currentSeason) {
                return;
            }
            return loadResource(
                'season',
                () => getScheduleBySeason(currentSeason),
                (schedule) => setAllSeasonSchedule(schedule || []),
                (error) => {
                    console.error(
                        clearOnError
                            ? 'Error fetching full season schedule:'
                            : 'Error refreshing full season schedule:',
                        error
                    );
                    if (clearOnError) {
                        setAllSeasonSchedule([]);
                    }
                }
            );
        },
        [loadResource]
    );

    const fetchConferenceSchedule = useCallback(() => {
        const selection = selectionRef.current;
        if (!mountedRef.current || !selection.season || !selection.selectedConference) {
            return;
        }
        setConfLoading(true);
        return loadResource(
            'conference',
            () => getConferenceSchedule(selection.season, selection.selectedConference),
            (schedule) => setConferenceSchedule(schedule || []),
            (error) => {
                console.error('Error fetching conference schedule:', error);
                setConferenceSchedule([]);
            },
            () => setConfLoading(false)
        );
    }, [loadResource]);

    const loadConferenceRules = useCallback(() => {
        const conference = selectionRef.current.selectedConference;
        if (!conference) {
            return;
        }
        const applyRules = (rules) => {
            setNumConferenceGames(rules?.numConferenceGames || DEFAULT_CONFERENCE_GAMES);
            setProtectedRivalries(rules?.protectedRivalries || []);
            setDivisions(rules?.divisions || []);
        };
        return loadResource(
            'rules',
            () => getConferenceRules(conference),
            applyRules,
            (error) => {
                console.error('Error loading conference rules:', error);
                applyRules(null);
            }
        );
    }, [loadResource]);

    const fetchTeamSchedule = useCallback(() => {
        const selection = selectionRef.current;
        if (!mountedRef.current || !selection.season || !selection.selectedTeam) {
            return;
        }
        setTeamLoading(true);
        return loadResource(
            'team',
            () => getScheduleBySeasonAndTeam(selection.season, selection.selectedTeam.name),
            (schedule) => setTeamFullSchedule((schedule || []).sort((a, b) => (a.week || 0) - (b.week || 0))),
            (error) => {
                console.error('Error fetching schedule:', error);
                setTeamFullSchedule([]);
            },
            () => setTeamLoading(false)
        );
    }, [loadResource]);

    const fetchPostseasonSchedule = useCallback(() => {
        const currentSeason = selectionRef.current.season;
        if (!mountedRef.current || !currentSeason) {
            return;
        }
        setPostseasonLoading(true);
        return loadResource(
            'postseason',
            () => getPostseasonSchedule(currentSeason),
            (schedule) => setPostseasonSchedule(schedule || []),
            (error) => {
                console.error('Error fetching postseason schedule:', error);
                setPostseasonSchedule([]);
            },
            () => setPostseasonLoading(false)
        );
    }, [loadResource]);

    useEffect(() => {
        if (season) {
            refreshAllSeasonSchedule(true);
        }
    }, [season, refreshAllSeasonSchedule]);

    useEffect(() => {
        if (season && selectedConference && tab === 'conference') {
            fetchConferenceSchedule();
            loadConferenceRules();
        }
    }, [season, selectedConference, tab, fetchConferenceSchedule, loadConferenceRules]);

    useEffect(() => {
        if (season && selectedTeam && tab === 'team') {
            fetchTeamSchedule();
        }
    }, [season, selectedTeam, tab, fetchTeamSchedule]);

    useEffect(() => {
        if (season && tab === 'postseason') {
            fetchPostseasonSchedule();
        }
    }, [season, tab, fetchPostseasonSchedule]);

    return {
        allSeasonSchedule,
        conferenceSchedule,
        confLoading,
        teamFullSchedule,
        teamLoading,
        postseasonSchedule,
        postseasonLoading,
        numConferenceGames,
        setNumConferenceGames,
        protectedRivalries,
        setProtectedRivalries,
        divisions,
        setDivisions,
        refreshAllSeasonSchedule,
        fetchConferenceSchedule,
        fetchTeamSchedule,
        fetchPostseasonSchedule,
    };
};

export default useAdminScheduleData;
