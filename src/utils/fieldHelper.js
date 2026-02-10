/**
 * Helper to safely read schedule/game fields that may be in camelCase or snake_case.
 * Backend uses SNAKE_CASE serialization, but frontend may use camelCase.
 * @param {Object} obj - The object to read from
 * @param {string} camel - The camelCase property name
 * @param {string} snake - The snake_case property name
 * @returns {*} The value of the property, or undefined if neither exists
 */
export const field = (obj, camel, snake) => {
    return obj[camel] !== undefined ? obj[camel] : obj[snake];
};
