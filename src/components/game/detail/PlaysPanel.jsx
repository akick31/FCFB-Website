import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import SegTabs from '../../ui/SegTabs';
import SelectPill from '../../ui/SelectPill';
import StatusPill from '../../ui/StatusPill';
import { describePlay, formatDownDistanceSpot } from '../../../utils/formatPlay';

const COUNT_OPTIONS = [{ value: '5', label: 'Last 5' }, { value: '10', label: 'Last 10' }, { value: '25', label: 'Last 25' }, { value: '50', label: 'Last 50' }, { value: 'all', label: 'All plays' }];

const PlayRow = ({ play, homeAbbr, awayAbbr, homeName, awayName }) => {
    const spot = formatDownDistanceSpot(play, homeAbbr, awayAbbr);
    const description = describePlay(play, { homeName, awayName });
    const teamAbbr = play.possession === 'HOME' ? homeAbbr : awayAbbr;
    const hasNumbers = play.offensive_number != null && play.defensive_number != null;
    return (
        <Box sx={{ px: 1.75, py: 1, borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 'none' } }}>
            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'baseline', fontSize: '0.8rem' }}>
                <Box component="b" sx={{ color: 'var(--text-dim)', fontSize: '0.64rem', width: 38, flex: '0 0 auto' }}>{teamAbbr}</Box>
                <Box sx={{ flex: 1 }}>
                    {spot ? `${spot}. ` : ''}{description}.
                    {play.scored && <Box component="span" sx={{ ml: 0.75 }}><StatusPill variant="championship">Score</StatusPill></Box>}
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.72rem', fontWeight: 700, flex: '0 0 auto', fontVariantNumeric: 'tabular-nums' }}>{play.away_score}-{play.home_score}</Box>
            </Box>
            {hasNumbers && (
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.68rem', mt: '3px', ml: '48px' }}>
                    Offense: {play.offensive_number}, Defense: {play.defensive_number}{play.difference != null ? `, Difference: ${play.difference}` : ''}
                </Box>
            )}
        </Box>
    );
};

PlayRow.propTypes = { play: PropTypes.object.isRequired, homeAbbr: PropTypes.string, awayAbbr: PropTypes.string, homeName: PropTypes.string, awayName: PropTypes.string };

const PlaysPanel = ({ plays, homeAbbr, awayAbbr, homeName, awayName }) => {
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('new');
    const [search, setSearch] = useState('');
    const [count, setCount] = useState('5');

    const ordered = useMemo(() => {
        const ascending = plays.filter((play) => play.actual_result !== 'END_OF_GAME').sort((a, b) => (a.play_number || 0) - (b.play_number || 0));
        let previousTotal = 0;
        return ascending.map((play) => {
            const total = (play.home_score || 0) + (play.away_score || 0);
            const scored = total > previousTotal;
            previousTotal = total;
            return { ...play, scored };
        });
    }, [plays]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        let result = ordered;
        if (filter === 'scoring') result = result.filter((play) => play.scored);
        if (query) {
            result = result.filter((play) => `${describePlay(play, { homeName, awayName })} ${play.possession === 'HOME' ? homeAbbr : awayAbbr} ${formatDownDistanceSpot(play, homeAbbr, awayAbbr)}`.toLowerCase().includes(query));
        }
        return sort === 'new' ? [...result].reverse() : result;
    }, [ordered, filter, search, sort, homeAbbr, awayAbbr, homeName, awayName]);

    const shown = count === 'all' ? filtered : filtered.slice(0, Number(count));

    return (
        <Panel header="Plays">
            <Box sx={{ display: 'flex', gap: '8px', px: 1.75, py: 1.25, borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap', alignItems: 'center' }}>
                <SegTabs ariaLabel="Play filter" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'scoring', label: 'Scoring' }]} />
                <SelectPill label="Show" value={count} onChange={setCount} options={COUNT_OPTIONS} />
                <Box component="button" type="button" onClick={() => setSort((s) => (s === 'new' ? 'old' : 'new'))} sx={{ border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: 1.1, py: 0.5, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                    {sort === 'new' ? '↓ Newest first' : '↑ Oldest first'}
                </Box>
                <Box component="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search plays (touchdown, first down…)" aria-label="Search plays" sx={{ flex: 1, minWidth: 150, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: 1.25, py: 0.75, font: 'inherit', fontSize: '0.8rem', '&::placeholder': { color: 'var(--text-dim)' } }} />
            </Box>
            {shown.length === 0 ? (
                <Box sx={{ p: 2.5, textAlign: 'center', color: 'var(--text-muted)' }}>No plays match.</Box>
            ) : shown.map((play) => (
                <PlayRow key={play.play_id || play.play_number} play={play} homeAbbr={homeAbbr} awayAbbr={awayAbbr} homeName={homeName} awayName={awayName} />
            ))}
            <Box sx={{ px: 1.75, py: 1.25, borderTop: '1px solid var(--line-soft)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                Showing {shown.length} of {filtered.length} plays
            </Box>
        </Panel>
    );
};

PlaysPanel.propTypes = {
    plays: PropTypes.array.isRequired,
    homeAbbr: PropTypes.string,
    awayAbbr: PropTypes.string,
    homeName: PropTypes.string,
    awayName: PropTypes.string,
};

export default PlaysPanel;
