import { Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { styled } from '@mui/system';

export const StyledTableContainer = styled(TableContainer)({
    maxWidth: '90%',
    margin: '0 auto',
    boxShadow: 'none',
});

export const StyledTable = styled(Table)({
    minWidth: 600,
    borderCollapse: 'collapse',
});

export const StyledTableHead = styled(TableHead)({
    padding: '8px',
    fontSize: '12px',
    textAlign: 'center',
    alignContent: 'center',
    fontWeight: 'bold',
});

export const StyledTableCell = styled(TableCell)({
    padding: '8px',
    fontSize: '12px',
    textAlign: 'center',
    alignContent: 'center',
    whiteSpace: 'nowrap',
    borderRight: '1px solid #ddd',
    '&:last-child': {
        borderRight: 'none',
    }
});

export const StyledTableHeadCell = styled(StyledTableCell)({
    fontWeight: 'bold',
});

export const StyledTableRow = styled(TableRow)({
    '&:nth-of-type(odd)': {
        backgroundColor: '#f9f9f9',
    },
    '&:hover': {
        backgroundColor: '#f1f1f1',
    },
});
