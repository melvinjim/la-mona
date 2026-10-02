/**
 * URL pública del sitio. En Vercel se toma sola la del dominio de producción;
 * para usar un dominio propio define NEXT_PUBLIC_SITE_URL (ej. https://lamona.com.co).
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
