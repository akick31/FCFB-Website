import React from 'react';
import PropTypes from 'prop-types';
import PagedFooter from './PagedFooter';
import usePagedRows from '../../hooks/usePagedRows';

const Paged = ({ rows, pageSize = 25, resetKey, noun, children }) => {
    const { page, pageCount, pageRows, setPage } = usePagedRows(rows, pageSize, resetKey);
    return (
        <>
            {children(pageRows)}
            <PagedFooter
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={rows.length}
                onChange={setPage}
                noun={noun}
            />
        </>
    );
};

Paged.propTypes = {
    rows: PropTypes.array.isRequired,
    pageSize: PropTypes.number,
    resetKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    noun: PropTypes.string,
    children: PropTypes.func.isRequired,
};

export default Paged;
