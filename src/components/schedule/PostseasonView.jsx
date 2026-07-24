import React, { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import SectionTitle from '../ui/SectionTitle';
import StatusPill from '../ui/StatusPill';
import TeamMark from '../ui/TeamMark';
import ConferenceMark from '../ui/ConferenceMark';
import PlayoffBracket from './PlayoffBracket';
import { conferenceLabel } from '../constants/conferences';

const PostseasonRow = ({ game, label, teamsMap }) => {
    const navigate = useNavigate();
    const homeWin = game.home_score > game.away_score;
    const markFor = (name) => teamsMap[name] || { name };
    const side = (name, score, isWinner) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: game.finished && !isWinner ? 'var(--text-dim)' : 'var(--text)' }}>
            <TeamMark team={markFor(name)} size={20} />
            <Box component="span" sx={{ fontWeight: 700, width: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</Box>
            <Box component="span" sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.05rem', width: 28, textAlign: 'right' }}>{game.finished ? score : ''}</Box>
        </Box>
    );
    return (
        <Box
            onClick={() => game.game_id && navigate(`/game-details/${game.game_id}`)}
            sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '14px', alignItems: 'center', px: 1.75, py: 1.1, borderBottom: '1px solid var(--line-soft)', cursor: 'pointer', '&:hover': { background: 'var(--surface-2)' }, '&:last-of-type': { borderBottom: 'none' } }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                {side(game.away_team, game.away_score, game.away_score > game.home_score)}
                {side(game.home_team, game.home_score, homeWin)}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right', whiteSpace: 'nowrap' }}>
                {label}
            </Box>
            <StatusPill variant={game.finished ? 'final' : 'ghost'}>{game.finished ? 'Final' : 'Upcoming'}</StatusPill>
        </Box>
    );
};

PostseasonRow.propTypes = {
    game: PropTypes.object.isRequired,
    label: PropTypes.node,
    teamsMap: PropTypes.object.isRequired,
};

const bowlLabel = (game) => (
    <>
        {game.postseason_game_logo && <img src={game.postseason_game_logo} alt="" style={{ height: 20, width: 'auto', objectFit: 'contain' }} />}
        {game.postseason_game_name || 'Bowl'}
    </>
);

const PostseasonView = ({ postseasonSchedule, teamsMap, loading }) => {
    const { rounds, conferenceChampionships, bowls, playoffField } = useMemo(() => {
        const roundMap = {};
        const ccg = [];
        const bowlGames = [];
        let maxSeed = 0;
        for (const game of postseasonSchedule) {
            if (game.playoff_round != null) {
                if (!roundMap[game.playoff_round]) roundMap[game.playoff_round] = [];
                roundMap[game.playoff_round].push(game);
                maxSeed = Math.max(maxSeed, game.playoff_home_seed || 0, game.playoff_away_seed || 0);
            } else if (game.game_type === 'CONFERENCE_CHAMPIONSHIP') {
                ccg.push(game);
            } else if (game.game_type === 'BOWL') {
                bowlGames.push(game);
            }
        }
        return { rounds: roundMap, conferenceChampionships: ccg, bowls: bowlGames, playoffField: maxSeed };
    }, [postseasonSchedule]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            {Object.keys(rounds).length > 0 && (
                <>
                    <SectionTitle title="Playoff bracket" note={playoffField ? `${playoffField}-team field` : null} />
                    <PlayoffBracket rounds={rounds} teamsMap={teamsMap} />
                </>
            )}

            {bowls.length > 0 && (
                <>
                    <SectionTitle title="Bowls" note={`${bowls.length} games`} />
                    <Panel>
                        {bowls.map((game) => (
                            <PostseasonRow key={game.game_id || game.id} game={game} teamsMap={teamsMap} label={bowlLabel(game)} />
                        ))}
                    </Panel>
                </>
            )}

            {conferenceChampionships.length > 0 && (
                <>
                    <SectionTitle title="Conference championships" />
                    <Panel>
                        {conferenceChampionships.map((game) => {
                            const conference = teamsMap[game.home_team]?.conference;
                            return (
                                <PostseasonRow
                                    key={game.game_id || game.id}
                                    game={game}
                                    teamsMap={teamsMap}
                                    label={<>
                                        <ConferenceMark conference={conference} size={18} />
                                        {conference ? `${conferenceLabel(conference)} Championship` : 'Conference Championship'}
                                    </>}
                                />
                            );
                        })}
                    </Panel>
                </>
            )}
        </Box>
    );
};

PostseasonView.propTypes = {
    postseasonSchedule: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    loading: PropTypes.bool,
};

export default PostseasonView;
