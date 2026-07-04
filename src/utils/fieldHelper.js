// Backend uses snake_case serialization, but frontend may reference camelCase field names.
export const field = (obj, camel, snake) => {
    return obj[camel] !== undefined ? obj[camel] : obj[snake];
};
