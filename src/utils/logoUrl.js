const CFP_IMAGE_BASE = import.meta.env.VITE_API_URL || 'http://localhost:1313';

export const resolveLogoUrl = (logo) => (logo ? (logo.startsWith('http') ? logo : `${CFP_IMAGE_BASE}/images/${logo}`) : null);
