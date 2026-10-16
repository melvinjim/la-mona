/**
 * Crédito de quien hizo el sitio.
 *
 * Va en el pie de las páginas internas y al final de la portada. El enlace no fija color:
 * hereda el del texto que lo rodea y al pasar por encima solo se aclara, para que se vea
 * bien tanto sobre el pie oscuro como sobre el naranja de la portada.
 */
export function MadeBy({ className }: { className?: string }) {
  return (
    <p className={className}>
      Powered by{" "}
      <a
        href="https://www.instagram.com/buildwithorvyn/"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold underline underline-offset-2 transition hover:opacity-70"
      >
        Orvyn
      </a>
      <span className="sr-only"> (se abre en una pestaña nueva)</span>
    </p>
  );
}
