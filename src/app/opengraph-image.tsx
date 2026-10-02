import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";

// Imagen que aparece al compartir el enlace por WhatsApp, Instagram, Facebook, etc.
export const alt = "Restaurante La Mona: menú disponible para llevar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FONT = "Barlow Condensed";

/** Descarga solo las letras necesarias de Google Fonts. Si falla, se usa la fuente por defecto. */
async function loadFont(weight: number, text: string) {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${FONT.replace(" ", "+")}:wght@${weight}&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const response = await fetch(url);
    return response.ok ? await response.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const site = await getSite();
  const logo = await readFile(join(process.cwd(), "public", site.logo));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const text = `${site.fullName} Menú disponible para llevar Desayunos · Ejecutivos · Asados · Domicilios`;
  const glyphs = text + text.toUpperCase();
  const [bold, extraBold] = await Promise.all([
    loadFont(700, glyphs),
    loadFont(800, glyphs),
  ]);
  const fonts: { name: string; data: ArrayBuffer; weight: 700 | 800; style: "normal" }[] = [];
  if (bold) fonts.push({ name: FONT, data: bold, weight: 700, style: "normal" });
  if (extraBold) fonts.push({ name: FONT, data: extraBold, weight: 800, style: "normal" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#fc6402",
          fontFamily: fonts.length ? FONT : undefined,
          color: "#1a1a16",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -150,
            top: -170,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "#ff7d2e",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -120,
            bottom: -200,
            width: 420,
            height: 420,
            borderRadius: 9999,
            border: "56px solid #ec5203",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 770,
            paddingLeft: 72,
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "#1a1a16",
              color: "#ffffff",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              padding: "10px 24px",
              borderRadius: 9999,
            }}
          >
            {site.fullName}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 30,
              fontSize: 118,
              fontWeight: 800,
              lineHeight: 0.9,
              textTransform: "uppercase",
            }}
          >
            <div style={{ display: "flex", color: "#ffffff" }}>Menú disponible</div>
            <div style={{ display: "flex" }}>para llevar</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Desayunos · Ejecutivos · Asados · Domicilios
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={330}
            height={330}
            alt=""
            style={{
              borderRadius: 9999,
              border: "10px solid #ffffff",
              boxShadow: "0 28px 60px rgba(26,26,22,0.4)",
            }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
