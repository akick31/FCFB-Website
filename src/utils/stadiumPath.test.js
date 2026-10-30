import { stadiumPath } from './stadiumPath';

test('stadium links use the id so they survive renames and dotted names', () => {
    expect(stadiumPath({ id: 17, name: 'A. W. Mumford Stadium' })).toBe('/stadium/17');
});

test('a stadium without a known id falls back to a name query that never looks like a file', () => {
    expect(stadiumPath({ name: 'A. W. Mumford Stadium' })).toBe('/stadium?name=A.%20W.%20Mumford%20Stadium');
});
