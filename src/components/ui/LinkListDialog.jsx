import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import EditDialog from './EditDialog';
import PagedFooter from './PagedFooter';
import usePagedRows from '../../hooks/usePagedRows';

const PAGE_SIZE = 12;

const LinkListDialog = ({ open, title, items, onClose }) => {
    const { page, pageCount, pageRows, setPage } = usePagedRows(items, PAGE_SIZE, title);
    return (
        <EditDialog open={open} title={title} onClose={onClose} maxWidth="sm">
            <Box sx={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                {pageRows.map((item) => (
                    <Box
                        key={item.key}
                        component={Link}
                        to={item.to}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            px: '14px',
                            py: '8px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: 'inherit',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--line-soft)',
                            '&:last-of-type': { borderBottom: 'none' },
                            '&:hover': { background: 'var(--surface-2)' },
                        }}
                    >
                        {item.content}
                    </Box>
                ))}
                <PagedFooter
                    page={page}
                    pageCount={pageCount}
                    pageSize={PAGE_SIZE}
                    total={items.length}
                    onChange={setPage}
                    noun="games"
                    compact
                />
            </Box>
        </EditDialog>
    );
};

LinkListDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            to: PropTypes.string,
            content: PropTypes.node,
        })
    ).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default LinkListDialog;
