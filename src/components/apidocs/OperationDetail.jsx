import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import apiClient from '../../api/apiClient';
import { backendRoot } from '../../api/apiDocsApi';
import JsonViewer from './JsonViewer';

const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '8px', font: 'inherit', fontSize: '0.82rem' };
const labelSx = { fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' };
const sendBtnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', py: '9px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.5, cursor: 'not-allowed' } };

const ParamInput = ({ param, value, onChange }) => (
    <Box>
        <Box sx={{ ...labelSx, mb: '4px' }}>{param.name}{param.required && ' *'}</Box>
        {param.schema?.enum ? (
            <Box component="select" sx={inputSx} value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="">Select...</option>
                {param.schema.enum.map((option) => <option key={option} value={option}>{option}</option>)}
            </Box>
        ) : (
            <Box component="input" sx={inputSx} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
    </Box>
);

ParamInput.propTypes = { param: PropTypes.object.isRequired, value: PropTypes.string.isRequired, onChange: PropTypes.func.isRequired };

const ParamGroup = ({ title, params, paramValues, setParamValues }) => {
    if (params.length === 0) return null;
    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ ...labelSx, mb: '8px' }}>{title}</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {params.map((p) => (
                    <ParamInput
                        key={p.name}
                        param={p}
                        value={paramValues[p.name] || ''}
                        onChange={(val) => setParamValues((v) => ({ ...v, [p.name]: val }))}
                    />
                ))}
            </Box>
        </Box>
    );
};

ParamGroup.propTypes = { title: PropTypes.string.isRequired, params: PropTypes.array.isRequired, paramValues: PropTypes.object.isRequired, setParamValues: PropTypes.func.isRequired };

const OperationDetail = ({ operation, isLoggedIn }) => {
    const [paramValues, setParamValues] = useState({});
    const [bodyText, setBodyText] = useState('');
    const [sending, setSending] = useState(false);
    const [formError, setFormError] = useState('');
    const [response, setResponse] = useState(null);

    useEffect(() => {
        setParamValues({});
        setBodyText(operation.requestBody ? '{}' : '');
        setFormError('');
        setResponse(null);
    }, [operation.id]);

    const pathParams = operation.parameters.filter((p) => p.in === 'path');
    const queryParams = operation.parameters.filter((p) => p.in === 'query');

    const send = async () => {
        setFormError('');
        const missing = pathParams.filter((p) => !paramValues[p.name]);
        if (missing.length > 0) {
            setFormError(`Missing required path param: ${missing.map((p) => p.name).join(', ')}`);
            return;
        }

        let resolvedPath = operation.path;
        pathParams.forEach((p) => {
            resolvedPath = resolvedPath.replace(`{${p.name}}`, encodeURIComponent(paramValues[p.name]));
        });

        const params = {};
        queryParams.forEach((p) => {
            const value = paramValues[p.name];
            if (value !== undefined && value !== '') params[p.name] = value;
        });

        let data;
        if (operation.requestBody) {
            try {
                data = bodyText ? JSON.parse(bodyText) : {};
            } catch {
                setFormError('Request body is not valid JSON');
                return;
            }
        }

        setSending(true);
        setResponse(null);
        try {
            const res = await apiClient.request({ method: operation.method, url: `${backendRoot}${resolvedPath}`, params, data });
            setResponse({ status: res.status, data: res.data });
        } catch (err) {
            setResponse({ status: err.response?.status, data: err.response?.data ?? err.message });
        } finally {
            setSending(false);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ fontSize: '0.85rem', color: 'var(--text)', mb: 2 }}>{operation.summary}</Box>

            {!isLoggedIn && <Alert severity="info" sx={{ mb: 2 }}>You&apos;re not logged in. Public endpoints will work as shown; endpoints that require an account will return an authentication error.</Alert>}

            <ParamGroup title="Path parameters" params={pathParams} paramValues={paramValues} setParamValues={setParamValues} />
            <ParamGroup title="Query parameters" params={queryParams} paramValues={paramValues} setParamValues={setParamValues} />

            {operation.requestBody && (
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Request body (JSON)</Box>
                    <Box
                        component="textarea"
                        rows={6}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        sx={{ ...inputSx, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', resize: 'vertical' }}
                    />
                </Box>
            )}

            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

            <Box component="button" onClick={send} disabled={sending} sx={sendBtnSx}>
                {sending ? 'Sending…' : 'Send request'}
            </Box>

            {response && (
                <Box sx={{ mt: 2 }}>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Response{response.status ? ` (${response.status})` : ''}</Box>
                    <JsonViewer value={response.data} />
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
    }).isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
};

export default OperationDetail;
