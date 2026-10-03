"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

/** Cliente del navegador, usado solo para subir fotos desde el panel. */
export const browserClient = () =>
  createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
