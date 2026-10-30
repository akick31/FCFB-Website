import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import StatTile from '../ui/StatTile';
import LinkListDialog from '../ui/LinkListDialog';
import UpsetLine from './UpsetLine';
import { linkButtonSx } from '../../styles/controls';

const UpsetsTile = ({ upsets, brewing }) => {
    const [open, setOpen] = useState(false);
    const largest = upsets?.[0];
    return (
        <>
            <StatTile
                compact
                label="Upsets this week"
                value={upsets ? upsets.length : '-'}
                caption={
                    <>
                        {largest && (
                            <Box>
                                <Box sx={{ fontWeight: 800 }}>
                                    Largest upset{largest.points > 0 ? `, +${largest.points}` : ''}
                                </Box>
                                <UpsetLine upset={largest} />
                            </Box>
                        )}
                        {upsets?.length > 1 && (
                            <Box
                                component="button"
                                type="button"
                                onClick={() => setOpen(true)}
                                sx={{ ...linkButtonSx, fontSize: 'inherit' }}
                            >
                                All {upsets.length} upsets
                            </Box>
                        )}
                        {brewing > 0 && <Box>{brewing} more brewing</Box>}
                    </>
                }
            />
            {upsets && (
                <LinkListDialog
                    open={open}
                    title="Upsets this week"
                    onClose={() => setOpen(false)}
                    items={upsets.map((upset) => ({
                        key: upset.game_id,
                        to: `/game-details/${upset.game_id}`,
                        content: <UpsetLine upset={upset} full plain />,
                    }))}
                />
            )}
        </>
    );
};

UpsetsTile.propTypes = { upsets: PropTypes.array, brewing: PropTypes.number };

export default UpsetsTile;
