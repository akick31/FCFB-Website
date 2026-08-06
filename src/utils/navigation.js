export const goBackOr = (navigate, fallbackPath) => {
    if (typeof window !== 'undefined' && window.history.state?.idx > 0) {
        navigate(-1);
    } else {
        navigate(fallbackPath);
    }
};
