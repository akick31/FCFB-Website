import { inputSx, labelSx } from './apiExplorerStyles';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import axios from 'axios';
import { backendRoot } from '../../api/apiDocsApi';
import { useApiExplorerLookups } from './useApiExplorerLookups';
import { paramConfig } from '../../utils/apiDocsParamConfig';
import { humanizeParamName } from '../../utils/humanize';
import { MethodBadge } from './OperationList';
import JsonViewer from './JsonViewer';
import RequestPreview from './RequestPreview';
import ParamGroup from './ParamGroup';

const sendBtnSx = {
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '16px',
    py: '9px',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
};

const parseJsonOrText = (text) => {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

const OperationDetail = ({ operation, apiKey }) => {
    const [paramValues, setParamValues] = useState({});
    const [bodyText, setBodyText] = useState('');
    const [file, setFile] = useState(null);
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');
    const [response, setResponse] = useState(null);
    const lookups = useApiExplorerLookups(operation, apiKey);
    const requestRef = useRef(null);
    useLayoutEffect(() => {
        requestRef.current?.abort();
        setSending(false);
        setResponse(null);
        return () => requestRef.current?.abort();
    }, [operation.id, apiKey]);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (!response?.imageBlob) {
            setImageUrl(null);
            return undefined;
        }
        const url = URL.createObjectURL(response.imageBlob);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [response]);

    useEffect(() => {
        setParamValues({});
        setBodyText(operation.requestBody ? '{}' : '');
        setFile(null);
        setFormError('');
        setResponse(null);
    }, [operation.id]);

    const pathParams = useMemo(() => operation.parameters.filter((p) => p.in === 'path'), [operation]);
    const queryParams = useMemo(() => operation.parameters.filter((p) => p.in === 'query'), [operation]);

    const buildRequest = () => {
        let resolvedPath = operation.path;
        pathParams.forEach((p) => {
            const config = paramConfig(p, lookups, paramValues, operation.path);
            const raw = paramValues[p.name];
            const resolved = raw ? (config.resolve ? config.resolve(raw) : raw) : null;
            resolvedPath = resolvedPath.replace(
                `{${p.name}}`,
                resolved != null ? encodeURIComponent(resolved) : `{${p.name}}`
            );
        });

        const params = {};
        queryParams.forEach((p) => {
            const value = paramValues[p.name];
            const config = paramConfig(p, lookups, paramValues, operation.path);
            if (config.uiType === 'pageable') {
                const pageable = value || {};
                if (pageable.page !== undefined && pageable.page !== '') {
                    params.page = pageable.page;
                }
                if (pageable.size !== undefined && pageable.size !== '') {
                    params.size = pageable.size;
                }
                if (pageable.sortField) {
                    params.sort = `${pageable.sortField},${pageable.sortDirection || 'asc'}`;
                }
                return;
            }
            if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
                return;
            }
            params[p.name] = config.resolve ? config.resolve(value) : value;
        });

        return { resolvedPath, params };
    };

    const send = async () => {
        setFormError('');
        const missing = pathParams.filter((p) => !paramValues[p.name]);
        if (missing.length > 0) {
            setFormError(
                `Missing required parameter: ${missing.map((p) => paramConfig(p, lookups, paramValues, operation.path).label || humanizeParamName(p.name)).join(', ')}`
            );
            return;
        }
        if (operation.fileField && !file) {
            setFormError('Choose a file to upload');
            return;
        }

        const { resolvedPath, params } = buildRequest();

        let data;
        if (operation.fileField) {
            data = new FormData();
            data.append(operation.fileField, file);
        } else if (operation.requestBody) {
            try {
                data = bodyText ? JSON.parse(bodyText) : {};
            } catch {
                setFormError('Request body is not valid JSON');
                return;
            }
        }

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setSending(true);
        setResponse(null);
        try {
            const res = await axios.request({
                method: operation.method,
                url: `${backendRoot}${resolvedPath}`,
                params,
                data,
                headers: { 'X-Api-Key': apiKey, 'X-Client-Name': 'fcfb-website' },
                responseType: operation.binaryResponse ? 'blob' : 'json',
            });
            if (controller.signal.aborted) {
                return;
            }
            if (operation.binaryResponse && res.data instanceof Blob) {
                setResponse({ status: res.status, imageBlob: res.data });
            } else {
                setResponse({ status: res.status, data: res.data });
            }
        } catch (err) {
            if (controller.signal.aborted) {
                return;
            }
            if (err.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                if (controller.signal.aborted) {
                    return;
                }
                setResponse({ status: err.response.status, data: parseJsonOrText(text) });
            } else {
                setResponse({ status: err.response?.status, data: err.response?.data ?? err.message });
            }
        } finally {
            if (!controller.signal.aborted) {
                setSending(false);
            }
        }
    };

    const preview = buildRequest();

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MethodBadge method={operation.method} />
                <Box
                    sx={{
                        fontSize: '0.76rem',
                        color: 'var(--text-dim)',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                >
                    {operation.path}
                </Box>
            </Box>

            {!apiKey && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Enter your API key above to send live requests.
                </Alert>
            )}

            <ParamGroup
                title="Path parameters"
                params={pathParams}
                paramValues={paramValues}
                setParamValues={setParamValues}
                lookups={lookups}
                operationPath={operation.path}
            />
            <ParamGroup
                title="Query parameters"
                params={queryParams}
                paramValues={paramValues}
                setParamValues={setParamValues}
                lookups={lookups}
                operationPath={operation.path}
            />

            {operation.fileField && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>File</Box>
                    <Box
                        component="input"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        sx={{ ...inputSx, py: '7px' }}
                    />
                </Box>
            )}

            {operation.requestBody && !operation.fileField && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Request body (JSON)</Box>
                    <Box
                        component="textarea"
                        rows={6}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        sx={{
                            ...inputSx,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            resize: 'vertical',
                        }}
                    />
                </Box>
            )}

            <RequestPreview
                operation={operation}
                apiKey={apiKey}
                resolvedPath={preview.resolvedPath}
                params={preview.params}
                bodyText={bodyText}
            />

            {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {formError}
                </Alert>
            )}

            <Box component="button" onClick={send} disabled={!apiKey || sending} sx={sendBtnSx}>
                {sending ? 'Sending…' : 'Send request'}
            </Box>

            {response && (
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Response{response.status ? ` (${response.status})` : ''}</Box>
                    {imageUrl ? (
                        <Box
                            component="img"
                            src={imageUrl}
                            alt="Response"
                            sx={{ maxWidth: '100%', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}
                        />
                    ) : (
                        <JsonViewer value={response.data} />
                    )}
                </Box>
            )}
        </Box>
    );
};

OperationDetail.propTypes = {
    operation: PropTypes.shape({
        id: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
        method: PropTypes.string.isRequired,
        summary: PropTypes.string.isRequired,
        parameters: PropTypes.array.isRequired,
        requestBody: PropTypes.object,
        fileField: PropTypes.string,
        binaryResponse: PropTypes.bool,
    }).isRequired,
    apiKey: PropTypes.string.isRequired,
};

export default OperationDetail;
