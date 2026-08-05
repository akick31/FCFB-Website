import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import PageWrap from './PageWrap';
import PageHeading from '../ui/PageHeading';
import AdminNav from '../admin/AdminNav';
import { useSeo } from '../../hooks/useSeo';

const AdminLayout = ({ title, controls, children }) => {
    useSeo({ title: `${typeof title === 'string' ? title : 'Admin'} | FCFB` });

    return (
        <PageWrap>
            <PageHeading eyebrow="Restricted, commissioner tools" title={title}>
                {controls}
            </PageHeading>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: '16px' }}>
                <AdminNav />
                <Box sx={{ minWidth: 0 }}>{children}</Box>
            </Box>
        </PageWrap>
    );
};

AdminLayout.propTypes = {
    title: PropTypes.node.isRequired,
    controls: PropTypes.node,
    children: PropTypes.node.isRequired,
};

export default AdminLayout;
