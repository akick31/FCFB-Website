import React, { useRef, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { uploadLogo } from '../../api/uploadApi';
import { resolveLogoUrl } from '../../utils/logoUrl';
import { helpSx, inputSx, labelSx, secondaryButtonSx } from '../../styles/controls';

const LogoUrlField = ({ label, value, onChange, uploadKind, fallback, placeholder, previewBg = '#ffffff' }) => {
    const shown = value || fallback;
    const fileInput = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const upload = async (event) => {
        const file = event.target.files[0];
        event.target.value = '';
        if (!file) {
            return;
        }
        setUploading(true);
        setUploadError(null);
        try {
            const result = await uploadLogo(file, uploadKind);
            onChange(result.url);
        } catch (error) {
            setUploadError(error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box>
            {label && <Box sx={labelSx}>{label}</Box>}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box
                    component="input"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    aria-label={label || undefined}
                    sx={{ ...inputSx, minWidth: 0 }}
                />
                <Box
                    component="button"
                    type="button"
                    onClick={() => fileInput.current.click()}
                    disabled={uploading}
                    sx={{ ...secondaryButtonSx, flex: '0 0 auto' }}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </Box>
                <Box
                    component="input"
                    type="file"
                    accept="image/*"
                    ref={fileInput}
                    onChange={upload}
                    aria-label={`Upload ${label || 'logo'}`}
                    sx={{ display: 'none' }}
                />
                <Box
                    sx={{
                        flex: '0 0 auto',
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--line)',
                        background: previewBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    {shown ? (
                        <Box
                            component="img"
                            src={resolveLogoUrl(shown)}
                            alt=""
                            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <Box sx={{ fontSize: '0.6rem', color: previewBg === '#ffffff' ? '#00000055' : '#ffffff55' }}>
                            -
                        </Box>
                    )}
                </Box>
            </Box>
            {uploadError && <Box sx={{ ...helpSx, color: 'var(--live)' }}>{uploadError}</Box>}
        </Box>
    );
};

LogoUrlField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    uploadKind: PropTypes.oneOf(['POSTSEASON', 'CONFERENCE', 'TEAM']).isRequired,
    fallback: PropTypes.string,
    placeholder: PropTypes.string,
    previewBg: PropTypes.string,
};

export default LogoUrlField;
