/** 8000 -> "8.000" */
export function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 8000 -> "$8.000" */
export function formatCOP(value: number): string {
  return `$${formatNumber(value)}`;
}

/** "05:00" -> "5:00 a.m." */
export function formatTime(hhmm: string): string {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const suffix = hours < 12 ? "a.m." : "p.m.";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** "la 1:00 a.m." / "las 5:00 a.m." */
export function formatTimeWithArticle(hhmm: string): string {
  const hours = Number(hhmm.split(":")[0]) % 12;
  return `${hours === 1 ? "la" : "las"} ${formatTime(hhmm)}`;
}
