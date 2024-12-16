import {Box, Paper, Typography} from "@mui/material"; // Import necessary Material UI components
import { styled } from '@mui/system';

const COLORS = {
    text: {
        primary: '#333333',
        secondary: '#666666',
        light: '#ffffff'
    },
    background: {
        light: '#f5f5f5',
        white: '#ffffff'
    },
    error: {
        main: '#d32f2f',
        light: '#f3e6e6'
    },
    success: {
        main: '#2e7d32',
        light: '#e6f3e6'
    }
};

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

// Styled Components
export const Header = styled("div")({
    backgroundColor: "#0A74DA",
    color: "white",
    padding: "20px",
    textAlign: "center",
    marginBottom: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
});

// Styled components

export const ScoreboardContainer = styled("div")({
    width: "100%",
    maxWidth: "1400px", // Limit the max width if needed
    margin: "0 auto",   // Ensure it's centered
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginTop: "20px",
    justifyItems: "center", // Center grid items
});

// Parent container for page content (already centered using flexbox)
export const PageContainer = styled("div")({
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
});


export const TabContainer = styled(Paper)({
    width: "100%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
});

export const GameSummaryContainer = styled(Box)`
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;

    @media (max-width: 600px) {
        flex-direction: column;
        align-items: center;
    }
`;

export const SummaryStatCard = styled(Paper)`
    flex: 1;
    padding: 16px;
    text-align: center;
    transition: transform 0.3s ease;
    background-color: ${COLORS.background.white};
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 8px rgba(0,0,0,0.15);
    }

    h3 {
        color: ${COLORS.text.secondary};
        margin-bottom: 8px;
        font-weight: 500;
    }

    p {
        font-size: 1.5rem;
        font-weight: bold;
        color: ${COLORS.text.primary};
    }

    @media (max-width: 600px) {
        width: 100%;
        max-width: 400px;
    }
`;

export const StyledTableContainer = styled(Box)`
    width: 100%;
    overflow-x: auto;
    margin-top: 16px;
`;

export const PlayHighlight = {
    touchdown: {
        backgroundColor: COLORS.success.light,
        color: COLORS.success.main
    },
    turnover: {
        backgroundColor: COLORS.error.light,
        color: COLORS.error.main
    },
    defaultPlay: {
        backgroundColor: 'inherit'
    }
};

export const getPlayHighlightStyle = (play) => {
    if (play.result === 'Touchdown') return PlayHighlight.touchdown;
    if (play.result === 'Turnover') return PlayHighlight.turnover;
    return PlayHighlight.defaultPlay;
};