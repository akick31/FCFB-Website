import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamMark from './TeamMark';
import { inputSx as baseInputSx } from '../../styles/controls';

const inputSx = {
    ...baseInputSx,
    pr: '30px',
};

const teamsOf = (option) => option.teams || (option.team ? [option.team] : []);

const SearchableSelect = ({ id, value, onChange, options, placeholder }) => {
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState(null);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => setQuery(value), [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const updateRect = () => setRect(inputRef.current?.getBoundingClientRect() ?? null);
        updateRect();
        window.addEventListener('scroll', updateRect, true);
        window.addEventListener('resize', updateRect);
        return () => {
            window.removeEventListener('scroll', updateRect, true);
            window.removeEventListener('resize', updateRect);
        };
    }, [open]);

    const filtered = (
        query ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase())) : options
    ).slice(0, 200);

    const selected = options.find((option) => option.label === query);
    const selectedTeams = selected ? teamsOf(selected) : [];

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
                sx={selectedTeams.length ? { ...inputSx, pl: `${14 + selectedTeams.length * 22}px` } : inputSx}
            />
            {selectedTeams.length > 0 && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        gap: '4px',
                        pointerEvents: 'none',
                    }}
                >
                    {selectedTeams.map((team) => (
                        <TeamMark key={team} team={{ name: team }} size={18} decorative />
                    ))}
                </Box>
            )}
            <Box
                sx={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--text-dim)',
                    fontSize: '0.65rem',
                }}
            >
                ▾
            </Box>
            {open &&
                filtered.length > 0 &&
                rect &&
                createPortal(
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    px: '10px',
                                    py: '8px',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    color: 'var(--text)',
                                    '&:hover': { background: 'var(--surface-raise)' },
                                }}
                            >
                                {teamsOf(option).map((team) => (
                                    <TeamMark key={team} team={{ name: team }} size={18} decorative />
                                ))}
                                {option.label}
                            </Box>
                        ))}
                    </Box>,
                    document.body
                )}
        </Box>
    );
};

SearchableSelect.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            label: PropTypes.string,
            team: PropTypes.string,
            teams: PropTypes.arrayOf(PropTypes.string),
        })
    ).isRequired,
    placeholder: PropTypes.string,
};

export default SearchableSelect;
