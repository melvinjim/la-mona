import { optionLabel, type ResolvedLine } from "./cart";
import { formatCOP, formatTime } from "./format";

export type Delivery = "domicilio" | "recoger";

export type Customer = {
  name: string;
  delivery: Delivery;
  address: string;
  payment: string;
};

export const emptyCustomer: Customer = {
  name: "",
  delivery: "domicilio",
  address: "",
  payment: "",
};

export function parseCustomer(raw: string | null): Customer {
  if (!raw) return emptyCustomer;
  try {
    const data = JSON.parse(raw) as Partial<Customer>;
    return {
      name: typeof data.name === "string" ? data.name.slice(0, 80) : "",
      delivery: data.delivery === "recoger" ? "recoger" : "domicilio",
      address: typeof data.address === "string" ? data.address.slice(0, 200) : "",
      payment: typeof data.payment === "string" ? data.payment.slice(0, 40) : "",
    };
  } catch {
    return emptyCustomer;
  }
}

/** Saludo según la hora de Colombia (minutos desde la medianoche). */
export function greetingFor(minutesSinceMidnight: number): string {
  const hour = Math.floor(minutesSinceMidnight / 60);
  if (hour >= 5 && hour < 12) return "buenos días";
  if (hour >= 12 && hour < 18) return "buenas tardes";
  return "buenas noches";
}

const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

/** Fecha, hora y minutos desde la medianoche en la zona horaria del restaurante. */
function localMoment(timeZone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return {
    date: `${get("day")}/${get("month")}/${get("year")}`,
    time: formatTime(`${get("hour")}:${get("minute")}`),
    minutes: hour * 60 + minute,
  };
}

type MessageInput = {
  lines: ResolvedLine[];
  customer: Customer;
  comments: string;
  timeZone: string;
  /** Momento del pedido; se puede fijar para probar. */
  now?: Date;
};

/**
 * Mensaje que llega al WhatsApp del restaurante. Solo cuenta las líneas "ok";
 * el total se calcula aquí con los precios vigentes del menú y va al final.
 */
export function buildOrderMessage({
  lines,
  customer,
  comments,
  timeZone,
  now = new Date(),
}: MessageInput): string {
  const items = lines.filter((line) => line.status === "ok");
  const total = items.reduce((sum, line) => sum + line.total, 0);
  const moment = localMoment(timeZone, now);

  const parts = [
    `Hola, ${greetingFor(moment.minutes)} 👋 Quisiera hacer este pedido:`,
    "",
    `🗓️ ${moment.date} · ⏰ ${moment.time}`,
    "",
    `*Tipo de servicio:* ${customer.delivery === "domicilio" ? "Domicilio" : "Recoger en el local"}`,
    `*Nombre:* ${oneLine(customer.name)}`,
  ];
  if (customer.delivery === "domicilio") {
    parts.push(`*Dirección:* ${oneLine(customer.address)}`);
  }

  parts.push("", "*📝 Pedido*");
  for (const line of items) {
    parts.push(`*${line.qty} x ${line.item.orderName}* — ${formatCOP(line.total)}`);
    const suffix = line.qty > 1 ? " c/u" : "";
    for (const { group, chosen } of line.choices) {
      if (chosen.length === 0) continue;
      parts.push(
        `   • ${group.title}: ${chosen.map((choice) => optionLabel(choice, suffix)).join(", ")}`,
      );
    }
    if (line.note) parts.push(`   • Nota: ${line.note}`);
  }

  const extra = comments.trim().replace(/\n{3,}/g, "\n\n");
  if (extra) parts.push("", "*💬 Comentarios*", extra);

  parts.push("", "*💲 Pago*");
  if (customer.payment) parts.push(`Medio de pago: ${customer.payment}`);
  parts.push(`*Total a pagar: ${formatCOP(total)}*`);

  return parts.join("\n");
}
