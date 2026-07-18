import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import ErrorBoundary from './components/ui/ErrorBoundary';

export { routeList, SITE_URL } from './routeMeta';

export function render(url) {
    return renderToString(
        <ErrorBoundary>
            <StaticRouter location={url}>
                <AppRoutes />
            </StaticRouter>
        </ErrorBoundary>
    );
}
