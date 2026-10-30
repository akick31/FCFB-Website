import React, { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import StadiumDirectory from '../../components/stadium/StadiumDirectory';
import { getStadiums } from '../../api/stadiumApi';
import { stadiumPath } from '../../utils/stadiumPath';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const Stadiums = () => {
    useSeo(ROUTE_META['/stadiums']);
    const navigate = useNavigate();
    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;
        getStadiums(true)
            .then((loaded) => active && setStadiums(loaded))
            .catch((err) => active && setError(err.message))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, []);

    const open = (name) => {
        const stadium = stadiums.find((entry) => entry.name === name);
        navigate(stadiumPath({ id: stadium?.id, name }));
    };

    return (
        <PageWrap>
            <PageHeading eyebrow="League" title="Stadiums" />
            {error && (
                <Alert severity="error" sx={{ mb: '12px' }}>
                    {error}
                </Alert>
            )}
            <StadiumDirectory stadiums={stadiums} loading={loading} onOpen={open} />
        </PageWrap>
    );
};

export default Stadiums;
