import { baseURL } from '../config/api';

export const getPlayAnimationUrl = (playId) => `${baseURL}/play-animation?playId=${playId}`;
