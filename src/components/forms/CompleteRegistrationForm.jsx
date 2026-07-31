import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { registerUser } from '../../api/authApi';
import { validateEmail, isStrongPassword } from '../../utils/validations';
import { getOpenTeams } from '../../api/teamApi';
import { validateUser } from '../../api/userApi';
import { formatOffensivePlaybook, formatDefensivePlaybook, formatPosition } from '../../utils/formatText';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS } from '../../constants/teamEnums';
import logo from '../../assets/graphics/main_logo.png';

const POSITIONS = ['HEAD_COACH', 'OFFENSIVE_COORDINATOR', 'DEFENSIVE_COORDINATOR', 'SPECIAL_TEAMS_COORDINATOR'];

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.88rem', '&:disabled': { opacity: 0.6 } };
const selectSx = { ...inputSx, cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const btnBaseSx = { width: '100%', border: 0, borderRadius: 'var(--r-sm)', py: '11px', font: 'inherit', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const Field = ({ label, helper, children }) => (
    <Box sx={{ mb: '12px' }}>
        <Box sx={labelSx}>{label}</Box>
        {children}
        {helper && <Box sx={{ mt: '4px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>{helper}</Box>}
    </Box>
);

Field.propTypes = { label: PropTypes.string.isRequired, helper: PropTypes.string, children: PropTypes.node.isRequired };

const CompleteRegistrationForm = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        username: '',
        coach_name: '',
        position: 'HEAD_COACH',
        offensive_playbook: 'FLEXBONE',
        defensive_playbook: 'FOUR_THREE',
        discord_tag: '',
        discord_id: '',
        email: '',
        confirm_email: '',
        password: '',
        confirm_password: '',
        team_choice_one: '',
        team_choice_two: '',
        team_choice_three: '',
    });

    const [validation, setValidation] = useState({
        emailValid: true,
        passwordValid: true,
        teamChoicesValid: true,
        errorMessage: null,
    });

    const [openTeams, setOpenTeams] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const discordTag = params.get('discordTag');
        const discordId = params.get('discordId');
        if (discordTag) setFormData((prev) => ({ ...prev, discord_tag: discordTag }));
        if (discordId) setFormData((prev) => ({ ...prev, discord_id: discordId }));

        getOpenTeams()
            .then(setOpenTeams)
            .catch(() => setValidation((prev) => ({ ...prev, errorMessage: 'Failed to load available teams. Please refresh the page.' })));
    }, [location.search]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === 'email') setValidation((prev) => ({ ...prev, emailValid: validateEmail(value) }));
        if (name === 'password') setValidation((prev) => ({ ...prev, passwordValid: isStrongPassword(value) }));
        if (validation.errorMessage) setValidation((prev) => ({ ...prev, errorMessage: null }));
    };

    const requiredTeamChoices = Math.min(3, openTeams.length);

    const validateTeamChoices = () => {
        const { team_choice_one, team_choice_two, team_choice_three } = formData;
        const choices = [team_choice_one, team_choice_two, team_choice_three].filter(Boolean);
        if (choices.length !== new Set(choices).size) return false;
        return choices.length >= requiredTeamChoices;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { email, confirm_email, password, confirm_password } = formData;
        const { emailValid, passwordValid } = validation;
        const teamChoicesValid = validateTeamChoices();
        setValidation((prev) => ({ ...prev, teamChoicesValid }));

        if (!emailValid || !passwordValid || !teamChoicesValid) {
            setValidation((prev) => ({ ...prev, errorMessage: 'Please fix the highlighted errors.' }));
            return;
        }
        if (email !== confirm_email) {
            setValidation((prev) => ({ ...prev, errorMessage: 'Emails do not match.' }));
            return;
        }
        if (password !== confirm_password) {
            setValidation((prev) => ({ ...prev, errorMessage: 'Passwords do not match.' }));
            return;
        }

        setIsSubmitting(true);
        try {
            const validationResponse = await validateUser(formData);
            if (validationResponse.discord_id_exists) {
                setValidation((prev) => ({ ...prev, errorMessage: 'Discord ID already exists.' }));
                return;
            }
            if (validationResponse.discord_username_exists) {
                setValidation((prev) => ({ ...prev, errorMessage: 'Discord Username already exists.' }));
                return;
            }
            if (validationResponse.username_exists) {
                setValidation((prev) => ({ ...prev, errorMessage: 'Username already exists.' }));
                return;
            }
            if (validationResponse.email_exists) {
                setValidation((prev) => ({ ...prev, errorMessage: 'Email already exists.' }));
                return;
            }

            await registerUser({ ...formData });
            navigate('/register/success');
        } catch {
            setValidation((prev) => ({ ...prev, errorMessage: 'Registration failed. Please try again.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const teamChoiceError = !validation.teamChoicesValid;
    const teamOptions = (excludeA, excludeB) => (
        <>
            <option value="">No selection</option>
            {openTeams.length > 0 ? (
                openTeams.map((team) => (
                    <option key={team} value={team} disabled={team === excludeA || team === excludeB}>{team}</option>
                ))
            ) : (
                <option value="" disabled>Loading teams…</option>
            )}
        </>
    );

    return (
        <Box sx={{ maxWidth: 460, mx: 'auto', my: '36px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <Box sx={{ background: 'linear-gradient(160deg, var(--brand-deep), #01293b)', p: '26px', textAlign: 'center' }}>
                <Box component="img" src={logo} alt="FCFB" sx={{ height: 70 }} />
            </Box>

            <Box sx={{ p: '22px' }}>
                <Box sx={{ mb: '18px', textAlign: 'center' }}>
                    <Box sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)', mb: '4px' }}>Complete your registration</Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Finish setting up your FCFB account and choose your team preferences</Box>
                </Box>

                {validation.errorMessage && <Alert severity="error" sx={{ mb: '16px' }}>{validation.errorMessage}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Field label="Username">
                        <Box component="input" name="username" value={formData.username} onChange={handleChange} required sx={inputSx} />
                    </Field>

                    <Field label="Coach name">
                        <Box component="input" name="coach_name" value={formData.coach_name} onChange={handleChange} required sx={inputSx} />
                    </Field>

                    <Field label="Discord tag" helper="Set from Discord OAuth">
                        <Box component="input" name="discord_tag" value={formData.discord_tag} disabled sx={inputSx} />
                    </Field>

                    <Field label="Position">
                        <Box component="select" name="position" value={formData.position} onChange={handleChange} sx={selectSx}>
                            {POSITIONS.map((position) => <option key={position} value={position}>{formatPosition(position)}</option>)}
                        </Box>
                    </Field>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Field label="Offensive playbook">
                            <Box component="select" name="offensive_playbook" value={formData.offensive_playbook} onChange={handleChange} sx={selectSx}>
                                {OFFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{formatOffensivePlaybook(playbook)}</option>)}
                            </Box>
                        </Field>
                        <Field label="Defensive playbook">
                            <Box component="select" name="defensive_playbook" value={formData.defensive_playbook} onChange={handleChange} sx={selectSx}>
                                {DEFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{formatDefensivePlaybook(playbook)}</option>)}
                            </Box>
                        </Field>
                    </Box>

                    <Box sx={{ mt: '18px', mb: '10px' }}>
                        <Box sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text)' }}>Team preferences</Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.74rem', mt: '2px' }}>
                            Choose up to 3 teams in order of preference.
                            {requiredTeamChoices > 0 && ` You must list at least ${requiredTeamChoices} team${requiredTeamChoices === 1 ? '' : 's'}.`}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <Field label="1st choice">
                            <Box component="select" name="team_choice_one" value={formData.team_choice_one} onChange={handleChange} sx={{ ...selectSx, borderColor: teamChoiceError ? 'var(--live)' : 'var(--line)' }}>
                                {teamOptions(formData.team_choice_two, formData.team_choice_three)}
                            </Box>
                        </Field>
                        <Field label="2nd choice">
                            <Box component="select" name="team_choice_two" value={formData.team_choice_two} onChange={handleChange} sx={{ ...selectSx, borderColor: teamChoiceError ? 'var(--live)' : 'var(--line)' }}>
                                {teamOptions(formData.team_choice_one, formData.team_choice_three)}
                            </Box>
                        </Field>
                        <Field label="3rd choice">
                            <Box component="select" name="team_choice_three" value={formData.team_choice_three} onChange={handleChange} sx={{ ...selectSx, borderColor: teamChoiceError ? 'var(--live)' : 'var(--line)' }}>
                                {teamOptions(formData.team_choice_one, formData.team_choice_two)}
                            </Box>
                        </Field>
                    </Box>

                    <Box sx={{ mt: '18px' }}>
                        <Field label="Email address">
                            <Box component="input" type="email" name="email" value={formData.email} onChange={handleChange} required sx={{ ...inputSx, borderColor: !validation.emailValid ? 'var(--live)' : 'var(--line)' }} />
                        </Field>
                        {!validation.emailValid && <Box sx={{ mt: '-8px', mb: '12px', fontSize: '0.7rem', color: 'var(--live)' }}>Invalid email address</Box>}

                        <Field label="Confirm email">
                            <Box component="input" type="email" name="confirm_email" value={formData.confirm_email} onChange={handleChange} required sx={{ ...inputSx, borderColor: formData.confirm_email && formData.email !== formData.confirm_email ? 'var(--live)' : 'var(--line)' }} />
                        </Field>
                        {formData.confirm_email !== '' && formData.email !== formData.confirm_email && <Box sx={{ mt: '-8px', mb: '12px', fontSize: '0.7rem', color: 'var(--live)' }}>Emails do not match</Box>}

                        <Field label="Password" helper="Must be 8+ chars & include a special character">
                            <Box component="input" type="password" name="password" value={formData.password} onChange={handleChange} required sx={{ ...inputSx, borderColor: !validation.passwordValid ? 'var(--live)' : 'var(--line)' }} />
                        </Field>

                        <Field label="Confirm password">
                            <Box component="input" type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required sx={{ ...inputSx, borderColor: formData.confirm_password && formData.password !== formData.confirm_password ? 'var(--live)' : 'var(--line)' }} />
                        </Field>
                        {formData.confirm_password !== '' && formData.password !== formData.confirm_password && <Box sx={{ mt: '-8px', mb: '12px', fontSize: '0.7rem', color: 'var(--live)' }}>Passwords do not match</Box>}
                    </Box>

                    <Box component="button" type="submit" disabled={isSubmitting} sx={{ ...btnBaseSx, background: 'var(--brand-deep)', color: '#fff', mt: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {isSubmitting && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                        {isSubmitting ? 'Completing registration…' : 'Complete registration'}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CompleteRegistrationForm;
