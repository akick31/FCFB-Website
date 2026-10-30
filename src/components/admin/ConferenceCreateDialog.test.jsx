/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ConferenceCreateDialog from './ConferenceCreateDialog';
import { createConference } from '../../api/conferenceApi';
import { refreshConferences } from '../../hooks/useConferencesMap';

jest.mock('../../api/conferenceApi', () => ({ createConference: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ refreshConferences: jest.fn() }));
jest.mock('./LogoUrlField', () => ({ __esModule: true, default: () => null }));

test('creating a conference normalizes the code and reports completion', async () => {
    createConference.mockResolvedValueOnce(undefined);
    const onCreated = jest.fn();
    render(<ConferenceCreateDialog open onClose={() => {}} onCreated={onCreated} />);
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: ' new code ' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: ' New Conference ' } });
    await act(async () => fireEvent.submit(screen.getByLabelText('Code').closest('form')));
    expect(createConference).toHaveBeenCalledWith({
        code: 'NEW_CODE',
        label: 'New Conference',
        logoUrl: null,
        logoUrlDark: null,
    });
    expect(refreshConferences).toHaveBeenCalledTimes(1);
    expect(onCreated).toHaveBeenCalledTimes(1);
});

test('a failed create keeps the dialog open with the error', async () => {
    createConference.mockRejectedValueOnce(new Error('Code already exists'));
    const onCreated = jest.fn();
    render(<ConferenceCreateDialog open onClose={() => {}} onCreated={onCreated} />);
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'ACC' } });
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'ACC' } });
    await act(async () => fireEvent.submit(screen.getByLabelText('Code').closest('form')));
    expect(screen.getByText('Code already exists')).toBeTruthy();
    expect(onCreated).not.toHaveBeenCalled();
});
