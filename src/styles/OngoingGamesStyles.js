import { Box, Typography } from "@mui/material"; // Import necessary Material UI components
import { styled } from '@mui/system';

// Styled components
export const CenteredContainer = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
`;

export const ErrorText = styled(Typography)`
    color: red;
    font-size: 18px;
`;

export const InfoText = styled(Typography)`
    color: #004260;
    font-size: 18px;
`;

export const GamesContainer = styled(Box)`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
`;

export const GameImage = styled('img')`
    cursor: pointer;
    width: 200px;
    height: 100px;
`;