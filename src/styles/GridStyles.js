import {styled} from "@mui/system";
import {Paper} from "@mui/material";

export const StyledPaper = styled(Paper)({
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%', // Full width of the container
});

export const GameImage = styled('img')`
    cursor: pointer;
`;