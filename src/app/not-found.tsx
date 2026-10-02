import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-brand-500 px-6 py-16 text-center text-ink">
      <div className="max-w-2xl">
        <p className="font-display text-xl font-bold uppercase tracking-[0.2em]">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-[clamp(3.5rem,14vw,7rem)] font-extrabold uppercase leading-[0.88] text-white">
          Esta página no está en el menú
        </h1>
        <p className="mt-5 text-lg font-semibold">
          Revisa el enlace o vuelve al inicio para ver todo lo que sí tenemos.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 text-lg font-bold text-white shadow-[0_3px_0_rgb(0_0_0/0.4)] transition hover:bg-black active:translate-y-px"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
