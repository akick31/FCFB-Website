import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import OperationList from './OperationList';
import OperationDetail from './OperationDetail';
import { getPublicApiSpec, getAdminApiSpec } from '../../api/apiDocsApi';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch'];

const buildOperations = (spec) => {
    const operations = [];
    Object.entries(spec?.paths || {}).forEach(([path, pathItem]) => {
        HTTP_METHODS.forEach((method) => {
            const operation = pathItem[method];
            if (!operation) return;
            operations.push({
                id: `${method}-${path}`,
                path,
                method: method.toUpperCase(),
                tag: operation.tags?.[0] || 'Other',
                summary: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
                parameters: operation.parameters || [],
                requestBody: operation.requestBody || null,
            });
        });
    });
    return operations.sort((a, b) => a.path.localeCompare(b.path));
};

const ApiExplorer = ({ specKind }) => {
    const [spec, setSpec] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const isLoggedIn = Boolean(localStorage.getItem('token'));

    useEffect(() => {
        const fetchSpec = specKind === 'admin' ? getAdminApiSpec : getPublicApiSpec;
        setLoading(true);
        fetchSpec()
            .then(setSpec)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [specKind]);

    const operations = useMemo(() => buildOperations(spec), [spec]);

    const filtered = useMemo(() => {
        if (!query) return operations;
        const q = query.toLowerCase();
        return operations.filter((op) => op.path.toLowerCase().includes(q) || op.summary.toLowerCase().includes(q) || op.tag.toLowerCase().includes(q));
    }, [operations, query]);

    const grouped = useMemo(() => {
        const groups = {};
        filtered.forEach((op) => {
            groups[op.tag] = groups[op.tag] || [];
            groups[op.tag].push(op);
        });
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    const selected = operations.find((op) => op.id === selectedId) || null;

    if (loading) {
        return (
            <Panel>
                <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel>
                <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
            </Panel>
        );
    }

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: '16px', alignItems: 'flex-start' }}>
            <Panel header="Endpoints" more={`${filtered.length}`}>
                <OperationList groups={grouped} query={query} onQueryChange={setQuery} selectedId={selectedId} onSelect={setSelectedId} />
            </Panel>
            <Panel header={selected ? `${selected.method} ${selected.path}` : 'Select an endpoint'}>
                {selected
                    ? <OperationDetail operation={selected} isLoggedIn={isLoggedIn} />
                    : <Box sx={{ p: 3, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Choose an endpoint on the left to see details and try it live.</Box>}
            </Panel>
        </Box>
    );
};

ApiExplorer.propTypes = { specKind: PropTypes.oneOf(['public', 'admin']).isRequired };

export default ApiExplorer;
