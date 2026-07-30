import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { reportFrontendError } from './api/frontendErrorsApi';

window.onerror = (message, source, lineno, colno, error) => {
    reportFrontendError({
        message: error?.message ?? String(message),
        stack: error?.stack ?? `${source}:${lineno}:${colno}`,
        url: window.location.href,
    });
};

window.onunhandledrejection = (event) => {
    const reason = event.reason;
    reportFrontendError({
        message: reason?.message ?? String(reason),
        stack: reason?.stack ?? null,
        url: window.location.href,
    });
};

const normalizePath = (path) => (path.length > 1 ? path.replace(/\/$/, '') : path);

const container = document.getElementById('root');
const prerenderedPath = container.dataset.prerenderedPath;

const servedHtmlMatchesRoute =
    prerenderedPath && normalizePath(prerenderedPath) === normalizePath(window.location.pathname);

if (servedHtmlMatchesRoute) {
    hydrateRoot(container, <App />);
} else {
    container.innerHTML = '';
    createRoot(container).render(<App />);
}
