/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LogoUrlField from './LogoUrlField';
import { uploadLogo } from '../../api/uploadApi';

jest.mock('../../api/uploadApi', () => ({ uploadLogo: jest.fn() }));
jest.mock('../../utils/logoUrl', () => ({ resolveLogoUrl: (logo) => logo }));

const Harness = () => {
    const [value, setValue] = useState('');
    return <LogoUrlField label="Logo URL" value={value} onChange={setValue} uploadKind="CONFERENCE" />;
};

const chooseFile = () =>
    fireEvent.change(screen.getByLabelText('Upload Logo URL'), {
        target: { files: [new File(['x'], 'crest.png', { type: 'image/png' })] },
    });

test('uploading a file stores the hosted url in the field', async () => {
    uploadLogo.mockResolvedValueOnce({ url: 'https://api.example.com/images/conference-logos/a.png' });
    render(<Harness />);

    chooseFile();

    await waitFor(() =>
        expect(screen.getByRole('textbox').value).toBe('https://api.example.com/images/conference-logos/a.png')
    );
    expect(uploadLogo).toHaveBeenCalledWith(expect.any(File), 'CONFERENCE');
});

test('a failed upload shows the error and keeps the current value', async () => {
    uploadLogo.mockRejectedValueOnce(new Error('File must be an image'));
    render(<Harness />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'https://example.com/old.png' } });

    chooseFile();

    expect(await screen.findByText('File must be an image')).toBeTruthy();
    expect(screen.getByRole('textbox').value).toBe('https://example.com/old.png');
});

test('an empty field previews the logo in use and says where it comes from', () => {
    const { container } = render(
        <LogoUrlField
            label="Dark logo URL"
            value=""
            onChange={() => {}}
            uploadKind="CONFERENCE"
            fallback="https://example.com/light.png"
            placeholder="Using the light logo"
        />
    );

    expect(container.querySelector('img').getAttribute('src')).toBe('https://example.com/light.png');
    expect(screen.getByRole('textbox').getAttribute('placeholder')).toBe('Using the light logo');
});
