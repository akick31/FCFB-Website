import {Box, styled} from "@mui/system";
import {Typography} from "@mui/material";

export const ScoreSummaryContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(2),
    width: '100%',
    maxWidth: 1000,
    margin: '0 auto',
}));

export const TeamBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,
    minWidth: 0,
}));

export const Rank = styled(Box)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    minWidth: '1.5rem',
}));

export const TeamLogo = styled('img')({
    width: 32,
    height: 32,
    objectFit: 'contain',
});

export const TeamInfo = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
});

export const TeamName = styled(Typography)({
    fontWeight: 600,
});

export const TeamRecord = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

export const TeamScore = styled(Box)(({ theme }) => ({
    fontSize: '1.5rem',
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
}));

export const FinalLabel = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    margin: `0 ${theme.spacing(2)}`,
}));

export const BoxScore = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const QuarterLabels = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '50px repeat(4, 30px) 30px',
    fontWeight: 600,
    fontSize: '0.9rem',
    textAlign: 'center',
    gap: '4px',
    width: '100%',
}));

export const ScoreRow = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '50px repeat(4, 30px) 30px',
    fontSize: '0.9rem',
    textAlign: 'center',
    gap: '4px',
    width: '100%',
}));

export const TeamAbbr = styled(Box)(({ theme }) => ({
    fontWeight: 600,
}));