const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1/arceus';

export const getPlayAnimationUrl = (playId) => `${baseURL}/play-animation?playId=${playId}`;
