import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import OperationList from './OperationList';
import OperationDetail from './OperationDetail';
import ApiKeyBar from './ApiKeyBar';
import { getPublicApiSpec, getAdminApiSpec } from '../../api/apiDocsApi';
import { getStoredApiKey, setStoredApiKey } from '../../utils/apiKeyStorage';
import { humanizeTag } from '../../utils/humanize';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch'];

const fileFieldOf = (operation) => {
    const multipartSchema = operation.requestBody?.content?.['multipart/form-data']?.schema;
    const properties = multipartSchema?.properties || {};
    return Object.keys(properties).find((key) => properties[key]?.format === 'binary') || null;
};

const isBinaryResponse = (operation) => {
    const responseContent = operation.responses?.['200']?.content || {};
    return Object.values(responseContent).some((media) => media.schema?.items?.format === 'byte' || media.schema?.format === 'binary');
};

const buildOperations = (spec) => {
    const operations = [];
    Object.entries(spec?.paths || {}).forEach(([path, pathItem]) => {
        HTTP_METHODS.forEach((method) => {
            const operation = pathItem[method];
            if (!operation) return;
            const fileField = fileFieldOf(operation);
            operations.push({
                id: `${method}-${path}`,
                path,
                method: method.toUpperCase(),
                tag: humanizeTag(operation.tags?.[0] || 'Other'),
                summary: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
                parameters: operation.parameters || [],
                requestBody: fileField ? null : operation.requestBody || null,
                fileField,
                binaryResponse: isBinaryResponse(operation),
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
    const [apiKey, setApiKey] = useState(getStoredApiKey);
    const isLoggedIn = Boolean(localStorage.getItem('token'));

    const updateApiKey = (value) => {
        setApiKey(value);
        setStoredApiKey(value);
    };

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

    return (
        <Box>
            <ApiKeyBar apiKey={apiKey} onChange={updateApiKey} isLoggedIn={isLoggedIn} />
            {loading ? (
                <Panel>
                    <Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress size={24} /></Box>
                </Panel>
            ) : error ? (
                <Panel>
                    <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
                </Panel>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px 1fr' }, gap: '16px', alignItems: 'flex-start' }}>
                    <Panel header="Endpoints" more={`${filtered.length}`}>
                        <OperationList groups={grouped} query={query} onQueryChange={setQuery} selectedId={selectedId} onSelect={setSelectedId} />
                    </Panel>
                    <Panel header={selected ? selected.summary : 'Select an endpoint'}>
                        {selected
                            ? <OperationDetail operation={selected} apiKey={apiKey} />
                            : <Box sx={{ p: 3, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Choose an endpoint on the left to see details and try it live.</Box>}
                    </Panel>
                </Box>
            )}
        </Box>
    );
};

ApiExplorer.propTypes = { specKind: PropTypes.oneOf(['public', 'admin']).isRequired };

export default ApiExplorer;
