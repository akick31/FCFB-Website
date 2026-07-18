import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import ErrorBoundary from './components/ui/ErrorBoundary';

const App = () => (
    <ErrorBoundary>
        <Router>
            <AppRoutes />
        </Router>
    </ErrorBoundary>
);

export default App;
