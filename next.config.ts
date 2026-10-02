import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dominios desde los que se pueden mostrar fotos subidas por el panel administrativo.
    // Agrega aquí el del servicio que uses (Supabase, Cloudinary, etc.).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
