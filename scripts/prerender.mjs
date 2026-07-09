import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const buildDir = path.join(root, 'build');
const ssrDir = path.join(root, 'dist-ssr');

const template = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf-8');

const { render, routeList, SITE_URL } = await import(
    pathToFileURL(path.join(ssrDir, 'entry-server.mjs')).href
);

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'Fake College Football',
    url: SITE_URL,
    logo: `${SITE_URL}/logo512.png`,
});

function buildHead({ title, description, path: routePath }) {
    const url = `${SITE_URL}${routePath}`;
    const title_ = escapeHtml(title);
    const description_ = escapeHtml(description);
    return [
        `<title>${title_}</title>`,
        `<meta name="description" content="${description_}" />`,
        `<link rel="canonical" href="${url}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="FCFB" />`,
        `<meta property="og:title" content="${title_}" />`,
        `<meta property="og:description" content="${description_}" />`,
        `<meta property="og:url" content="${url}" />`,
        `<meta property="og:image" content="${SITE_URL}/logo512.png" />`,
        `<meta name="twitter:card" content="summary" />`,
        `<meta name="twitter:title" content="${title_}" />`,
        `<meta name="twitter:description" content="${description_}" />`,
        `<meta name="twitter:image" content="${SITE_URL}/logo512.png" />`,
        `<script type="application/ld+json">${jsonLd}</script>`,
    ].join('\n    ');
}

for (const route of routeList) {
    const appHtml = render(route.path);
    const headHtml = buildHead(route);
    const html = template
        .replace('<!--app-head-->', headHtml)
        .replace('<!--app-html-->', appHtml);

    const outPath =
        route.path === '/'
            ? path.join(buildDir, 'index.html')
            : path.join(buildDir, route.path.replace(/^\//, ''), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`prerendered ${route.path} -> ${path.relative(root, outPath)}`);
}

const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routeList.map((route) => `  <url><loc>${SITE_URL}${route.path}</loc></url>`),
    '</urlset>',
    '',
].join('\n');
fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), sitemap);
console.log('wrote build/sitemap.xml');

fs.rmSync(ssrDir, { recursive: true, force: true });
