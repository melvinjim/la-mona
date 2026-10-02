import { optionLabel, type ResolvedLine } from "./cart";
import { formatCOP } from "./format";

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

type MessageInput = {
  lines: ResolvedLine[];
  customer: Customer;
  comments: string;
  minutes: number;
};

/**
 * Mensaje que llega al WhatsApp del restaurante. Solo cuenta las líneas "ok";
 * el total se calcula aquí con los precios vigentes del menú.
 */
export function buildOrderMessage({
  lines,
  customer,
  comments,
  minutes,
}: MessageInput): string {
  const items = lines.filter((line) => line.status === "ok");
  const total = items.reduce((sum, line) => sum + line.total, 0);

  const parts = [
    `Hola, ${greetingFor(minutes)}. Quisiera hacer este pedido:`,
    "",
  ];

  for (const line of items) {
    parts.push(`${line.qty} x ${line.item.orderName} — ${formatCOP(line.total)}`);
    for (const { group, chosen } of line.choices) {
      if (chosen.length === 0) continue;
      const suffix = line.qty > 1 ? " c/u" : "";
      parts.push(
        `   ${group.title}: ${chosen.map((option) => optionLabel(option, suffix)).join(", ")}`,
      );
    }
    if (line.note) parts.push(`   Nota: ${line.note}`);
  }

  parts.push("", `*Total: ${formatCOP(total)}*`, "");
  parts.push(`Nombre: ${oneLine(customer.name)}`);
  if (customer.delivery === "domicilio") {
    parts.push("Entrega: Domicilio");
    parts.push(`Dirección: ${oneLine(customer.address)}`);
  } else {
    parts.push("Entrega: Recoger en el local");
  }
  if (customer.payment) parts.push(`Pago: ${customer.payment}`);

  const extra = comments.trim().replace(/\n{3,}/g, "\n\n");
  if (extra) parts.push(`Comentarios: ${extra}`);

  return parts.join("\n");
}
