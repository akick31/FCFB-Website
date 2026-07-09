import { useEffect } from 'react';
import { SITE_URL } from '../routeMeta';

function setMeta(attr, key, content) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(href) {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

export function useSeo({ title, description, path }) {
    useEffect(() => {
        const routePath = path ?? window.location.pathname;
        document.title = title;
        setMeta('name', 'description', description);
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:url', `${SITE_URL}${routePath}`);
        setMeta('name', 'twitter:title', title);
        setMeta('name', 'twitter:description', description);
        setCanonical(`${SITE_URL}${routePath}`);
    }, [title, description, path]);
}
