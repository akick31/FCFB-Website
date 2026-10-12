export const camelOrSnakeField = (obj, camel, snake) => {
    return obj[camel] !== undefined ? obj[camel] : obj[snake];
};
