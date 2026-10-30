import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useParams } from 'react-router-dom';

const AdminEditRedirect = ({ listPath, param }) => {
    const params = useParams();
    return <Navigate to={`${listPath}?edit=${encodeURIComponent(params[param])}`} replace />;
};

AdminEditRedirect.propTypes = {
    listPath: PropTypes.string.isRequired,
    param: PropTypes.string.isRequired,
};

export default AdminEditRedirect;
