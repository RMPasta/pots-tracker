import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();
  return {
    rules: {
      allow: '/',
      disallow: ['/api/', '/dashboard/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
