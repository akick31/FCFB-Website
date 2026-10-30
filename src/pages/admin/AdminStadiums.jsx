import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Box, Alert } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import BackButton from '../../components/ui/BackButton';
import StadiumAdminTools from '../../components/stadium/StadiumAdminTools';
import StadiumCreateDialog from '../../components/stadium/StadiumCreateDialog';
import StadiumDirectory from '../../components/stadium/StadiumDirectory';
import StadiumEditor from '../../components/stadium/StadiumEditor';
import { stadiumPath } from '../../utils/stadiumPath';
import { getStadiums } from '../../api/stadiumApi';
import { compact, primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

const AdminStadiums = () => {
    const [params, setParams] = useSearchParams();
    const selected = params.get('name');
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [version, setVersion] = useState(0);
    const [creating, setCreating] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setStadiums(await getStadiums(true));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const open = (name) => setParams({ name });
    const closeToList = () => setParams({});

    const current = stadiums.find((stadium) => stadium.name === selected);

    const refresh = async () => {
        await load();
        setVersion((current) => current + 1);
    };

    const reopen = async (name) => {
        await load();
        setParams({ name }, { replace: true });
    };

    const errorAlert = error && (
        <Alert severity="error" sx={{ mb: '16px' }}>
            {error}
        </Alert>
    );

    if (selected) {
        return (
            <AdminLayout title={selected}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' }}>
                    <BackButton onBack={closeToList} label="All stadiums" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Box
                            component={Link}
                            to={stadiumPath({ id: current?.id, name: selected })}
                            sx={secondaryButtonSx}
                        >
                            View page
                        </Box>
                        {current && <StadiumAdminTools stadium={current} onChanged={refresh} />}
                    </Box>
                </Box>
                {errorAlert}
                <StadiumEditor
                    key={`${selected}:${version}`}
                    name={selected}
                    team={current?.teams[0]}
                    canEdit
                    onRenamed={reopen}
                />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Stadiums">
            {errorAlert}
            <StadiumDirectory
                stadiums={stadiums}
                loading={loading}
                onOpen={open}
                actions={
                    <Box
                        component="button"
                        type="button"
                        onClick={() => setCreating(true)}
                        sx={compact(primaryButtonSx)}
                    >
                        + New stadium
                    </Box>
                }
            />
            <StadiumCreateDialog
                open={creating}
                stadiums={stadiums}
                onOpenExisting={(name) => {
                    setCreating(false);
                    open(name);
                }}
                onClose={() => {
                    setCreating(false);
                    load();
                }}
            />
        </AdminLayout>
    );
};

export default AdminStadiums;
