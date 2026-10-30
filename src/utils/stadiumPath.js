export const stadiumPath = ({ id, name }) => (id ? `/stadium/${id}` : `/stadium?name=${encodeURIComponent(name)}`);
