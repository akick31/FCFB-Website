import { useState, useEffect, useRef } from 'react';
import { generateConferenceSchedule } from '../api/scheduleApi';

const useConferenceGeneration = ({
    season,
    selectedConference,
    scheduleLocked,
    conferenceTeams,
    numConferenceGames,
    protectedRivalries,
    divisions,
    showSnackbar,
    fetchConferenceSchedule,
    refreshAllSeasonSchedule,
    isMountedRef,
}) => {
    const generationRequestRef = useRef(0);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [generationLoading, setGenerationLoading] = useState(false);
    useEffect(() => {
        setGenerationLoading(false);
        return () => {
            generationRequestRef.current += 1;
        };
    }, [season, selectedConference]);

    const handleGenerateConferenceSchedule = async () => {
        if (scheduleLocked) {
            return;
        }
        const incompleteRivalries = protectedRivalries.filter((r) => (r.team1 && !r.team2) || (!r.team1 && r.team2));
        if (incompleteRivalries.length > 0) {
            showSnackbar('All protected rivalries must have both teams set before generating', 'error');
            return;
        }

        const generation = ++generationRequestRef.current;
        try {
            setGenerationLoading(true);
            const request = {
                season,
                conference: selectedConference,
                subdivision: conferenceTeams[0]?.subdivision || 'FBS',
                numConferenceGames,
                protectedRivalries: protectedRivalries.filter((r) => r.team1 && r.team2),
                startWeek: 1,
                divisions: divisions.filter(Boolean),
            };
            await generateConferenceSchedule(request);
            if (!isMountedRef.current || generation !== generationRequestRef.current) {
                return;
            }
            showSnackbar('Conference schedule generated successfully!');
            setGenerateDialogOpen(false);
            await fetchConferenceSchedule();
            refreshAllSeasonSchedule();
        } catch (err) {
            if (!isMountedRef.current || generation !== generationRequestRef.current) {
                return;
            }
            console.error('Error generating schedule:', err);
            showSnackbar('Failed to generate schedule: ' + err.message, 'error');
        } finally {
            if (isMountedRef.current && generation === generationRequestRef.current) {
                setGenerationLoading(false);
            }
        }
    };

    return { generateDialogOpen, setGenerateDialogOpen, generationLoading, handleGenerateConferenceSchedule };
};
export default useConferenceGeneration;
