import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import ApiExplorer from '../../components/apidocs/ApiExplorer';

const AdminApiDocs = () => (
    <AdminLayout title="Admin API Docs">
        <ApiExplorer specKind="admin" />
    </AdminLayout>
);

export default AdminApiDocs;
