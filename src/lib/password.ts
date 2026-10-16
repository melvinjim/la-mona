/** Lo mínimo que se le pide a una contraseña del panel. */
export const MIN_PASSWORD = 10;

/**
 * Revisa que la contraseña no sea fácil de adivinar. Devuelve qué le falta, o `null` si está
 * bien. Se usa igual en el navegador (para avisar mientras se escribe) y en el servidor, que
 * es donde de verdad cuenta.
 */
export function passwordProblem(password: string, email = ""): string | null {
  if (password.length < MIN_PASSWORD) {
    return `La contraseña necesita al menos ${MIN_PASSWORD} caracteres.`;
  }
  if (!/[a-zA-Z]/.test(password)) return "La contraseña necesita al menos una letra.";
  if (!/[0-9]/.test(password)) return "La contraseña necesita al menos un número.";
  if (/^(.)+$/.test(password)) return "Esa contraseña es la misma letra repetida.";

  const user = email.split("@")[0]?.toLowerCase() ?? "";
  if (user.length >= 4 && password.toLowerCase().includes(user)) {
    return "La contraseña no puede contener el correo.";
  }
  return null;
}
