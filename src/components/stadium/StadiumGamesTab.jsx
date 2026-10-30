import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import PagedFooter from '../ui/PagedFooter';
import SearchInput from '../ui/SearchInput';
import SelectPill from '../ui/SelectPill';
import StadiumGamesTable from './StadiumGamesTable';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';

const toolbarSx = { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', p: '10px 12px' };

const matches = (game, term) =>
    [game.home_team, game.away_team, game.postseason_game_name].some((text) => text?.toLowerCase().includes(term));

const StadiumGamesTab = ({ games, lead }) => {
    const [query, setQuery] = useState('');
    const [season, setSeason] = useState('ALL');
    const seasons = useMemo(() => [...new Set(games.map((game) => game.season))].sort((a, b) => b - a), [games]);
    const shown = useMemo(() => {
        const term = query.trim().toLowerCase();
        return games.filter(
            (game) => (season === 'ALL' || String(game.season) === season) && (!term || matches(game, term))
        );
    }, [games, query, season]);
    const [fitRef, pageSize] = useFitCount({ rowHeight: 36, minRows: 5, phoneCount: 8 });
    const { page, pageCount, pageRows, setPage } = usePagedRows(shown, pageSize, `${query}|${season}`);
    return (
        <Box ref={fitRef}>
            <Box sx={toolbarSx}>
                {lead}
                <SearchInput value={query} onChange={setQuery} placeholder="Search teams or bowls" />
                <SelectPill
                    label="Season"
                    value={season}
                    onChange={setSeason}
                    options={[
                        { value: 'ALL', label: 'All seasons' },
                        ...seasons.map((option) => ({ value: String(option), label: `Season ${option}` })),
                    ]}
                    sx={{ height: '38px' }}
                />
            </Box>
            <StadiumGamesTable games={pageRows} />
            <PagedFooter
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={shown.length}
                onChange={setPage}
                noun="games"
            />
        </Box>
    );
};

StadiumGamesTab.propTypes = {
    games: PropTypes.arrayOf(PropTypes.object).isRequired,
    lead: PropTypes.node,
};

export default StadiumGamesTab;
