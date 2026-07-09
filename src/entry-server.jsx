import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';

export { routeList, SITE_URL } from './routeMeta';

export function render(url) {
    return renderToString(
        <StaticRouter location={url}>
            <AppRoutes />
        </StaticRouter>
    );
}
