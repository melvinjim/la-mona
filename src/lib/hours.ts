import type { SiteSettings } from "@/lib/types";

type Schedule = SiteSettings["hours"];

const toMinutes = (hhmm: string) => {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
};

/** Minutos transcurridos desde la medianoche en la zona horaria del restaurante. */
export function minutesNow(timeZone: string, date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hours = Number(parts.find((part) => part.type === "hour")?.value);
  const minutes = Number(parts.find((part) => part.type === "minute")?.value);
  return hours * 60 + minutes;
}

export function isOpenAt(minutes: number, { open, close }: Schedule): boolean {
  const from = toMinutes(open);
  const to = toMinutes(close);
  if (from === to) return true;
  return from < to ? minutes >= from && minutes < to : minutes >= from || minutes < to;
}
