export const field = (obj, camel, snake) => {
    return obj[camel] !== undefined ? obj[camel] : obj[snake];
};
