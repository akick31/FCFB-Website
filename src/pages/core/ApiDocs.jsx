import React from 'react';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import ApiExplorer from '../../components/apidocs/ApiExplorer';
import { useSeo } from '../../hooks/useSeo';

const ApiDocs = () => {
    useSeo({ title: 'API docs | Fake College Football', description: 'Browse the FCFB API and try requests live.' });

    return (
        <PageWrap>
            <PageHeading eyebrow="Developers" title="API docs" />
            <ApiExplorer specKind="public" />
        </PageWrap>
    );
};

export default ApiDocs;
