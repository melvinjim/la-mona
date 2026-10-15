import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // El sitio ya no maneja fotos: la única imagen es el logo, y vive en /public.
    // Esto queda solo por si una instalación anterior guardó el logo en Supabase Storage,
    // cuando el panel todavía dejaba subirlo.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.in", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
