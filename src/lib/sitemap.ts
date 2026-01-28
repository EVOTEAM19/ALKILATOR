import { format } from 'date-fns';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
}

// Generar XML de sitemap
export function generateSitemap(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// URLs estáticas del sitio
export function getStaticSitemapUrls(baseUrl: string): SitemapUrl[] {
  const today = format(new Date(), 'yyyy-MM-dd');

  return [
    {
      loc: baseUrl,
      lastmod: today,
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/vehiculos`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/franquicias`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/terminos`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3,
    },
    {
      loc: `${baseUrl}/privacidad`,
      lastmod: today,
      changefreq: 'yearly',
      priority: 0.3,
    },
  ];
}

// URLs dinámicas (ubicaciones, etc.)
export async function getDynamicSitemapUrls(
  baseUrl: string,
  locations: { slug: string; updatedAt: string }[]
): Promise<SitemapUrl[]> {
  return locations.map((location) => ({
    loc: `${baseUrl}/alquiler-coches/${location.slug}`,
    lastmod: format(new Date(location.updatedAt), 'yyyy-MM-dd'),
    changefreq: 'weekly' as const,
    priority: 0.8,
  }));
}
