import { inputSx, labelSx } from './apiExplorerStyles';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { backendRoot } from '../../api/apiDocsApi';

const shellQuote = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

const buildCurlCommand = ({ method, url, params, apiKey, fileField, requestBody, bodyText }) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }
        (Array.isArray(value) ? value : [value]).forEach((entry) => query.append(key, entry));
    });
    const queryString = query.toString();
    const fullUrl = `${url}${queryString ? `?${queryString}` : ''}`;
    const keyToken = apiKey || 'YOUR_API_KEY';

    const lines = [`curl -X ${method} ${shellQuote(fullUrl)}`, `  -H "X-Api-Key: ${keyToken}"`];
    if (fileField) {
        lines.push(`  -F "${fileField}=@/path/to/file"`);
    } else if (requestBody) {
        lines.push('  -H "Content-Type: application/json"');
        lines.push(`  -d ${shellQuote(bodyText || '{}')}`);
    }
    return lines.join(' \\\n');
};

const RequestPreview = ({ operation, apiKey, resolvedPath, params, bodyText }) => {
    const [copied, setCopied] = useState(false);
    const url = `${backendRoot}${resolvedPath}`;
    const command = buildCurlCommand({
        method: operation.method,
        url,
        params,
        apiKey,
        fileField: operation.fileField,
        requestBody: operation.requestBody,
        bodyText,
    });

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '8px' }}>
                <Box sx={labelSx}>Request preview (curl)</Box>
                <Box
                    component="button"
                    onClick={copy}
                    sx={{
                        border: '1px solid var(--line)',
                        background: 'var(--surface-2)',
                        color: 'var(--text)',
                        borderRadius: 'var(--r-sm)',
                        px: '10px',
                        py: '4px',
                        font: 'inherit',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </Box>
            </Box>
            <Box
                component="pre"
                sx={{
                    ...inputSx,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: '0.76rem',
                    m: 0,
                    lineHeight: 1.5,
                }}
            >
                {command}
            </Box>
            <Box sx={{ mt: '6px', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                {apiKey
                    ? "This includes your personal API key. Treat it like a password, don't paste this command anywhere public."
                    : "Swap YOUR_API_KEY for your personal key. Keep it private, don't paste it into public channels or commit it to source control."}
            </Box>
        </Box>
    );
};

RequestPreview.propTypes = {
    operation: PropTypes.object.isRequired,
    apiKey: PropTypes.string.isRequired,
    resolvedPath: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    bodyText: PropTypes.string,
};

export default RequestPreview;
