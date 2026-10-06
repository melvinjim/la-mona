"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";
import { prepareImage } from "@/lib/image";
import { slug } from "@/lib/slug";
import { browserClient } from "@/lib/supabase/browser-client";
import { BUCKET } from "@/lib/supabase/config";
import { labelClass } from "./ui";

type Props = {
  /** Nombre del campo oculto que viaja en el formulario con la URL de la foto. */
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string;
};

const MAX_MB = 10;

/**
 * Foto guardada en Supabase Storage. Se reduce y se sube directo desde el navegador —sin
 * pasar por el servidor— y en el formulario solo viaja la dirección de la imagen.
 */
export function ImageField({ name, label, hint, defaultValue = "" }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  async function upload(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Ese archivo no es una imagen.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La foto pesa demasiado (máximo ${MAX_MB} MB).`);
      return;
    }

    setBusy(true);
    try {
      const image = await prepareImage(file);
      const base = slug(file.name.replace(/\.[^.]+$/, "")) || "foto";
      const path = `${Date.now()}-${base}.${image.extension}`;

      const supabase = browserClient();
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, image.blob, { cacheControl: "31536000", contentType: image.type });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `No se pudo subir la foto: ${cause.message}`
          : "No se pudo subir la foto.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0">
      <span className={labelClass}>{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}

      <input type="hidden" name={name} value={url} />

      <div className="mt-1.5 flex items-center gap-3">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-sand">
          {url ? (
            <Image src={url} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-ink-soft/50">
              <ImagePlus className="size-6" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-line px-4 py-2 text-sm font-bold transition hover:border-ink"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-4" aria-hidden="true" />
            )}
            {busy ? "Subiendo…" : url ? "Cambiar" : "Subir foto"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={busy}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload(file);
            }}
          />

          {url && (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-line px-3.5 py-2 text-sm font-bold text-ink-soft transition hover:border-ink hover:text-ink"
            >
              <X className="size-4" aria-hidden="true" />
              Quitar
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
