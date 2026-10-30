import React from 'react';
import { Box } from '@mui/material';
import Panel from '../ui/Panel';
import DataTable from '../ui/DataTable';
import { DEFAULT_NUMBER_BUCKET_SIZE, NUMBER_MAX } from '../../utils/scoutingReport';

import Chip from './ScoutingFilterChip';
import { inputSx, labelSx } from '../../styles/controls';
const sharePct = (value) => (value == null ? '-' : `${(value * 100).toFixed(1)}%`);
const BUCKET_SIZE_PRESETS = [100, 250, 375, 750, 1000];

const ScoutingNumberSummary = ({ favoriteNumbersList, bucketSize, setBucketSize, numberBuckets }) => (
    <Panel sx={{ mb: '16px' }}>
        <Box
            sx={{
                p: 2,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.4fr)' },
                gap: '20px',
                alignItems: 'start',
            }}
        >
            <Box>
                <Box sx={{ ...labelSx, mb: '8px' }}>Favorite numbers</Box>
                <DataTable minWidth={300} phoneMinWidth={0} dense>
                    <thead>
                        <tr>
                            <th className="lft">Number</th>
                            <th>Count</th>
                            <th>Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {favoriteNumbersList.length === 0 ? (
                            <tr>
                                <td className="lft" colSpan={3}>
                                    No numbers recorded.
                                </td>
                            </tr>
                        ) : (
                            favoriteNumbersList.map((entry) => (
                                <tr key={entry.number}>
                                    <td className="lft">{entry.number}</td>
                                    <td>{entry.count}</td>
                                    <td>{sharePct(entry.share)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </DataTable>
            </Box>

            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                        mb: '8px',
                    }}
                >
                    <Box sx={labelSx}>Number ranges (1-{NUMBER_MAX})</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <Box component="span" sx={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            Bucket size
                        </Box>
                        {BUCKET_SIZE_PRESETS.map((preset) => (
                            <Chip key={preset} active={bucketSize === preset} onClick={() => setBucketSize(preset)}>
                                {preset}
                            </Chip>
                        ))}
                        <Box
                            component="input"
                            type="number"
                            min={1}
                            max={NUMBER_MAX}
                            value={bucketSize}
                            onChange={(event) =>
                                setBucketSize(
                                    Math.min(
                                        NUMBER_MAX,
                                        Math.max(
                                            1,
                                            Math.floor(Number(event.target.value)) || DEFAULT_NUMBER_BUCKET_SIZE
                                        )
                                    )
                                )
                            }
                            sx={{ ...inputSx, width: '76px', textAlign: 'center' }}
                        />
                    </Box>
                </Box>
                <DataTable minWidth={360} phoneMinWidth={0} dense>
                    <thead>
                        <tr>
                            <th className="lft">Range</th>
                            <th>Count</th>
                            <th>Share</th>
                        </tr>
                    </thead>
                    <tbody>
                        {numberBuckets.map((bucket) => (
                            <tr key={bucket.label}>
                                <td className="lft">{bucket.label}</td>
                                <td>{bucket.count}</td>
                                <td>{sharePct(bucket.share)}</td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
            </Box>
        </Box>
    </Panel>
);
export default ScoutingNumberSummary;
