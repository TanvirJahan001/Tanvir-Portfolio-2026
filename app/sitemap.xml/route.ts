import { projects } from '@/lib/content';
import { siteUrl } from '@/lib/site';
export function GET(request: Request) {
  const base = siteUrl || new URL(request.url);
  const urls = [
    '/',
    '/experience',
    ...projects.map((p) => '/projects/' + p.slug),
  ]
    .map(
      (path) =>
        '<url><loc>' +
        new URL(path, base).href.replaceAll('&', '&amp;') +
        '</loc></url>',
    )
    .join('');
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls +
      '</urlset>',
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
