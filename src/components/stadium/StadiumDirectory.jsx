import React, { useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import PagedFooter from '../ui/PagedFooter';
import SelectPill from '../ui/SelectPill';
import Toggle from '../ui/Toggle';
import StadiumsTable from './StadiumsTable';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';
import { isTeamStadium, searchTextOf } from './stadiumUsage';
import { inputSx } from '../../styles/controls';

const KIND_FILTERS = [
    { value: 'all', label: 'All stadiums' },
    { value: 'team', label: 'Team stadiums' },
    { value: 'neutral', label: 'Neutral sites' },
];

const StadiumDirectory = ({ stadiums, loading, onOpen, actions }) => {
    const [showRetired, setShowRetired] = useState(false);
    const [query, setQuery] = useState('');
    const [kind, setKind] = useState('all');
    const visible = useMemo(
        () =>
            stadiums.filter(
                (stadium) =>
                    (showRetired || stadium.active) &&
                    (kind === 'all' || (kind === 'team') === isTeamStadium(stadium)) &&
                    (!query || searchTextOf(stadium).includes(query.toLowerCase()))
            ),
        [stadiums, showRetired, query, kind]
    );
    const [fitRef, pageSize] = useFitCount({ rowHeight: 36 });
    const { page, pageCount, pageRows, setPage } = usePagedRows(visible, pageSize, `${query}|${kind}|${showRetired}`);
    return (
        <Panel header={`Stadiums (${visible.length})`} more={actions}>
            <Box sx={{ p: '12px 14px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Box
                    component="input"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search stadiums, cities, teams or games"
                    aria-label="Search stadiums"
                    sx={{ ...inputSx, flex: '1 1 260px' }}
                />
                <SelectPill
                    label="Type"
                    value={kind}
                    onChange={setKind}
                    options={KIND_FILTERS}
                    ariaLabel="Stadium type"
                    sx={{ height: '38px' }}
                />
                <Box
                    component="label"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.78rem',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Toggle on={showRetired} onClick={() => setShowRetired(!showRetired)} />
                    Show retired
                </Box>
            </Box>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '24px' }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Box ref={fitRef}>
                    <StadiumsTable stadiums={pageRows} onOpen={onOpen} />
                    <PagedFooter
                        page={page}
                        pageCount={pageCount}
                        pageSize={pageSize}
                        total={visible.length}
                        onChange={setPage}
                        noun="stadiums"
                    />
                </Box>
            )}
        </Panel>
    );
};

StadiumDirectory.propTypes = {
    stadiums: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    onOpen: PropTypes.func.isRequired,
    actions: PropTypes.node,
};

export default StadiumDirectory;
