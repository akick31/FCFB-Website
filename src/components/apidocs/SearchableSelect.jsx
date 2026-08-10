import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '8px', pr: '30px', font: 'inherit', fontSize: '0.82rem' };

const SearchableSelect = ({ id, value, onChange, options, placeholder }) => {
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => setQuery(value), [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const updateRect = () => setRect(inputRef.current?.getBoundingClientRect() ?? null);
        updateRect();
        window.addEventListener('scroll', updateRect, true);
        window.addEventListener('resize', updateRect);
        return () => {
            window.removeEventListener('scroll', updateRect, true);
            window.removeEventListener('resize', updateRect);
        };
    }, [open]);

    const filtered = (query ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())) : options).slice(0, 200);

    const selectOption = (option) => {
        setQuery(option.label);
        onChange(option.label);
        setOpen(false);
    };

    return (
        <Box ref={containerRef} id={id} sx={{ position: 'relative' }}>
            <Box
                component="input"
                ref={inputRef}
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value);
                    onChange(event.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
                sx={inputSx}
            />
            <Box sx={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)', fontSize: '0.65rem' }}>▾</Box>
            {open && filtered.length > 0 && rect && createPortal(
                <Box
                    sx={{
                        position: 'fixed',
                        zIndex: 1500,
                        top: `${rect.bottom + 4}px`,
                        left: `${rect.left}px`,
                        width: `${rect.width}px`,
                        maxHeight: '240px',
                        overflowY: 'auto',
                        border: '1px solid var(--line)',
                        background: 'var(--surface-2)',
                        borderRadius: 'var(--r-sm)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    }}
                >
                    {filtered.map((option) => (
                        <Box
                            key={`${option.value}-${option.label}`}
                            onMouseDown={() => selectOption(option)}
                            sx={{
                                px: '10px',
                                py: '8px',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                color: 'var(--text)',
                                '&:hover': { background: 'var(--surface-raise)' },
                            }}
                        >
                            {option.label}
                        </Box>
                    ))}
                </Box>,
                document.body,
            )}
        </Box>
    );
};

SearchableSelect.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), label: PropTypes.string })).isRequired,
    placeholder: PropTypes.string,
};

export default SearchableSelect;
