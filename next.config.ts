import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dominios desde los que se pueden mostrar fotos subidas por el panel administrativo.
    remotePatterns: [
      // Supabase Storage (el bucket "menu" del panel).
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
