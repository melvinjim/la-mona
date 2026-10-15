import { optionLabel, type ResolvedLine } from "./cart";
import { formatCOP, formatTime } from "./format";

export type Delivery = "domicilio" | "recoger";

export type Customer = {
  name: string;
  delivery: Delivery;
  /** Barrio tal como lo escribió el cliente; el carrito lo reconoce contra la lista de barrios. */
  barrio: string;
  address: string;
  payment: string;
};

export const emptyCustomer: Customer = {
  name: "",
  delivery: "domicilio",
  barrio: "",
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
      barrio: typeof data.barrio === "string" ? data.barrio.slice(0, 80) : "",
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

/** Domicilio ya reconocido: el barrio (con su nombre oficial) y lo que cuesta llevar el pedido. */
export type Shipping = { zone: string; fee: number };

type MessageInput = {
  lines: ResolvedLine[];
  customer: Customer;
  comments: string;
  /** Barrio y valor del domicilio; `null` si no hay lista de barrios o es para recoger. */
  shipping?: Shipping | null;
  timeZone: string;
  /** Momento del pedido; se puede fijar para probar. */
  now?: Date;
};

/**
 * Mensaje que llega al WhatsApp del restaurante. Solo cuenta las líneas "ok";
 * el total (productos + domicilio) se calcula aquí con los precios vigentes y va al final.
 */
export function buildOrderMessage({
  lines,
  customer,
  comments,
  shipping = null,
  timeZone,
  now = new Date(),
}: MessageInput): string {
  const items = lines.filter((line) => line.status === "ok");
  const subtotal = items.reduce((sum, line) => sum + line.total, 0);
  const fee = customer.delivery === "domicilio" && shipping ? shipping.fee : 0;
  const total = subtotal + fee;
  const moment = localMoment(timeZone, now);

  const parts = [
    `Hola, ${greetingFor(moment.minutes)} 👋 Quisiera hacer este pedido:`,
    "",
    `🗓️ ${moment.date} · ⏰ ${moment.time}`,
    "",
    `*Tipo de servicio:* ${customer.delivery === "domicilio" ? "Domicilio" : "Recoger en el local"}`,
    `*Nombre:* ${oneLine(customer.name)}`,
  ];
  const delivering = customer.delivery === "domicilio";
  if (delivering) {
    const barrio = oneLine(shipping?.zone ?? customer.barrio);
    if (barrio) parts.push(`*Barrio:* ${barrio}`);
    parts.push(`*Dirección:* ${oneLine(customer.address)}`);
  }

  parts.push("", "*📝 Pedido*");
  for (const line of items) {
    parts.push(`*${line.qty} x ${line.item.orderName}* — ${formatCOP(line.total)}`);
    const suffix = line.qty > 1 ? " c/u" : "";
    // Con adicionales cobrados se escribe aparte lo que vale el plato solo. Sin esta línea el
    // "+$3.000" del adicional parece que hay que sumarlo al total, y ya está contado dentro.
    if (line.unitPrice > line.item.price) {
      parts.push(`   • Precio base: ${formatCOP(line.item.price)}${suffix}`);
    }
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
  // Sin barrio validado (el restaurante aún no cargó sus barrios) el domicilio se confirma por chat.
  const pendingFee = delivering && !shipping;
  if (delivering && shipping) {
    parts.push(`Total factura: ${formatCOP(subtotal)}`);
    parts.push(`Domicilio (${oneLine(shipping.zone)}): ${formatCOP(fee)}`);
  } else if (pendingFee) {
    parts.push("Domicilio: por confirmar");
  }
  parts.push(`*Total a pagar${pendingFee ? " (sin domicilio)" : ""}: ${formatCOP(total)}*`);

  return parts.join("\n");
}
