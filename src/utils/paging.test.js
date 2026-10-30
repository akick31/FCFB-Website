import { chunkPages, groupedPages } from './paging';

test('chunks fill each page in order', () => {
    expect(chunkPages([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunkPages([], 4)).toEqual([[]]);
});

test('grouped pages show every group on every page, sharing the rows', () => {
    const rows = ['r1', 'r2', 'r3', 'r4', 'r5', 'f1', 'f2', 'n1'];
    const pages = groupedPages((row) => row[0])(rows, 6);
    expect(pages).toEqual([['r1', 'r2', 'f1', 'f2', 'n1'], ['r3', 'r4'], ['r5']]);
});
