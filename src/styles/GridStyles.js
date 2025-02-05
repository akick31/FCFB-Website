import {styled} from "@mui/system";
import {Paper} from "@mui/material";

export const StyledPaper = styled(Paper)({
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifycontent: 'center',
    width: '80%', // Full width of the container
    backgroundColor: 'transparent'
});

export const GameImage = styled('img')`
    cursor: pointer;
`;