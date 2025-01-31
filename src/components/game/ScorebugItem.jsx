import React from 'react';
import { Card, CardMedia, Typography } from '@mui/material';

const ScorebugItem = ({ game }) => {
    const imageUrl = game.scorebug
        ? URL.createObjectURL(new Blob([game.scorebug], { type: 'image/png' }))
        : null;

    return (
        <Card>
            {imageUrl && (
                <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={`${game.homeTeam} vs ${game.awayTeam}`}
                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                />
            )}
            <Box p={2}>
                <Typography variant="h6">
                    {game.homeTeam} vs {game.awayTeam}
                </Typography>
                <Typography variant="body2">
                    Status: {game.gameStatus}
                </Typography>
            </Box>
        </Card>
    );
};

export default ScorebugItem;