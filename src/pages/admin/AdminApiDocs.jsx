import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import ApiExplorer from '../../components/apidocs/ApiExplorer';

const AdminApiDocs = () => (
    <AdminLayout title="API docs">
        <ApiExplorer specKind="admin" />
    </AdminLayout>
);

export default AdminApiDocs;
