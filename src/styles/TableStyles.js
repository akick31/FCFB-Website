import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/system';

export const StyledTableContainer = styled(TableContainer)({
    maxWidth: '90%', // Adjust the width for a more compact look
    margin: '0 auto', // Centers the table horizontally
    boxShadow: 'none', // Optional: removes shadow for a clean look
});

export const StyledTable = styled(Table)({
    minWidth: 600, // Make sure the table is wide enough but not too large
    borderCollapse: 'collapse', // Ensures the table does not have gaps between cells
});

export const StyledTableHead = styled(TableHead)({
    padding: '8px', // Reduces padding to make it compact
    fontSize: '12px', // Smaller font size for a more compact look
    textAlign: 'center', // Centers text in the cell
    alignContent: 'center', // Centers content in the cell
    fontWeight: 'bold', // Makes the header text bold
});

export const StyledTableCell = styled(TableCell)({
    padding: '8px', // Reduces padding to make it compact
    fontSize: '12px', // Smaller font size for a more compact look
    textAlign: 'center', // Centers text in the cell
    alignContent: 'center', // Centers content in the cell
    whiteSpace: 'nowrap', // Prevents text wrapping
    borderRight: '1px solid #ddd', // Adds vertical lines between columns
    // Optionally, remove the last column's border
    '&:last-child': {
        borderRight: 'none',
    }
});

export const StyledTableHeadCell = styled(StyledTableCell)({
    fontWeight: 'bold', // Make header text bold
});

export const StyledTableRow = styled(TableRow)({
    '&:nth-of-type(odd)': {
        backgroundColor: '#f9f9f9', // Alternates row colors
    },
    '&:hover': {
        backgroundColor: '#f1f1f1', // Hover effect for interactivity
    },
});
