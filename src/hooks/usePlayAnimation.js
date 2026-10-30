import { useEffect, useState } from 'react';
import { getPlayAnimation } from '../api/playAnimationApi';

const usePlayAnimation = (playId) => {
    const [state, setState] = useState({ status: 'loading', url: null });

    useEffect(() => {
        let active = true;
        let url = null;
        setState({ status: 'loading', url: null });
        getPlayAnimation(playId)
            .then((blob) => {
                url = URL.createObjectURL(blob);
                if (active) {
                    setState({ status: 'ready', url });
                }
            })
            .catch(() => active && setState({ status: 'failed', url: null }));
        return () => {
            active = false;
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [playId]);

    return state;
};

export default usePlayAnimation;
