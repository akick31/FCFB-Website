import React from 'react';
import {
    Box,
    TextField,
    Autocomplete,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import {
    btnPrimarySx,
    ctrlSx,
    labelSx,
    inputSx,
    dialogPaperSx,
    dialogTitleSx,
    autocompleteSx,
} from './postseasonStyles';

const EditPostseasonBowlDialog = ({
    open,
    onClose,
    game,
    name,
    onNameChange,
    venueNames,
    venue,
    onVenueChange,
    uploading,
    logo,
    logoPreview,
    onUpload,
    onCancel,
    onSubmit,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>Edit Bowl Game</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                {game && (
                    <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        {camelOrSnakeField(game, 'homeTeam', 'home_team')} vs{' '}
                        {camelOrSnakeField(game, 'awayTeam', 'away_team')}
                    </Box>
                )}
                <Box>
                    <Box component="label" sx={labelSx}>
                        Bowl game name
                    </Box>
                    <Box
                        component="input"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g., Rose Bowl, Sugar Bowl, etc."
                        sx={inputSx}
                    />
                </Box>
                <Box>
                    <Box component="label" sx={labelSx}>
                        Venue
                    </Box>
                    <Autocomplete
                        freeSolo
                        options={venueNames}
                        inputValue={venue}
                        onInputChange={(_, v) => onVenueChange(v || '')}
                        sx={autocompleteSx}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                placeholder="e.g., Mercedes-Benz Stadium, Atlanta, GA"
                            />
                        )}
                    />
                </Box>
                <Box>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="edit-logo-upload-button"
                        type="file"
                        onChange={onUpload}
                    />
                    <Box
                        component="label"
                        htmlFor="edit-logo-upload-button"
                        sx={{
                            ...ctrlSx,
                            width: '100%',
                            justifyContent: 'center',
                            gap: '8px',
                            opacity: uploading ? 0.6 : 1,
                            pointerEvents: uploading ? 'none' : 'auto',
                        }}
                    >
                        {uploading ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 16 }} />}
                        {uploading ? 'Uploading...' : logo ? 'Change Logo' : 'Upload Postseason Game Logo'}
                    </Box>
                    {logoPreview && (
                        <Box sx={{ mt: '12px', display: 'flex', justifyContent: 'center' }}>
                            <Avatar src={logoPreview} sx={{ width: 100, height: 100 }} variant="rounded" />
                        </Box>
                    )}
                    {logo && !logoPreview && (
                        <Alert severity="info" sx={{ mt: '8px' }}>
                            Logo: {logo}
                        </Alert>
                    )}
                </Box>
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            <Box component="button" type="button" onClick={onCancel} sx={ctrlSx}>
                Cancel
            </Box>
            <Box component="button" type="button" onClick={onSubmit} sx={btnPrimarySx}>
                Save
            </Box>
        </DialogActions>
    </Dialog>
);

export default EditPostseasonBowlDialog;
