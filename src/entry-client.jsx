import { hydrateRoot } from 'react-dom/client';
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

hydrateRoot(document.getElementById('root'), <App />);
