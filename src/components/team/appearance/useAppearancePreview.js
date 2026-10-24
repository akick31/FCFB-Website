import { useMemo } from 'react';
import { renderAppearancePreview } from '../../../api/teamAppearanceApi';
import { usePreviewImage } from '../../../hooks/usePreviewImage';

/** `body` must be stable (memoize it). */
export const useAppearancePreview = (team, view, body) => {
    const request = useMemo(() => ({ team, view, ...body }), [team, view, body]);
    return usePreviewImage(renderAppearancePreview, request);
};
