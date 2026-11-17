import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { sendContactMessage } from '../../api/contactApi';

const EMPTY_FORM = { name: '', email: '', subject: '', message: '', company: '' };
const FALLBACK_ERROR = 'Your message couldn’t be sent right now. Please try again later.';

const honeypotSx = { position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' };

const ContactDialog = ({ open, onClose, defaultName }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setForm({ ...EMPTY_FORM, name: defaultName || '' });
            setStatus('idle');
            setError('');
        }
    }, [open, defaultName]);

    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('sending');
        setError('');
        try {
            await sendContactMessage(form);
            setStatus('sent');
        } catch (err) {
            setError(err.response?.data?.error || FALLBACK_ERROR);
            setStatus('error');
        }
    };

    const sending = status === 'sending';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Contact Us</DialogTitle>
            {status === 'sent' ? (
                <>
                    <DialogContent>
                        <Alert severity="success">Thanks for reaching out. We&apos;ll get back to you soon.</Alert>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} variant="contained">Close</Button>
                    </DialogActions>
                </>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                            Questions, bug reports, or suggestions for the league? Send them our way.
                        </Typography>
                        <Box aria-hidden="true" sx={honeypotSx}>
                            <input type="text" name="company" value={form.company} onChange={updateField} tabIndex={-1} autoComplete="off" />
                        </Box>
                        <TextField label="Name" name="name" value={form.name} onChange={updateField} required fullWidth inputProps={{ maxLength: 100 }} />
                        <TextField label="Email" name="email" type="email" value={form.email} onChange={updateField} required fullWidth inputProps={{ maxLength: 200 }} />
                        <TextField label="Subject" name="subject" value={form.subject} onChange={updateField} required fullWidth inputProps={{ maxLength: 200 }} />
                        <TextField label="Message" name="message" value={form.message} onChange={updateField} required fullWidth multiline minRows={4} inputProps={{ maxLength: 5000 }} />
                        {status === 'error' && <Alert severity="error">{error}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} disabled={sending}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={sending}>
                            {sending ? 'Sending…' : 'Send message'}
                        </Button>
                    </DialogActions>
                </Box>
            )}
        </Dialog>
    );
};

ContactDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    defaultName: PropTypes.string,
};

export default ContactDialog;
