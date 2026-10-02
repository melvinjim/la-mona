"use client";

import { Check, Copy, ShoppingBag, TriangleAlert, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { optionLabel, type ResolvedLine } from "@/lib/cart";
import { formatCOP, formatTimeWithArticle } from "@/lib/format";
import { minutesNow } from "@/lib/hours";
import { customerStore } from "@/lib/local-store";
import {
  buildOrderMessage,
  parseCustomer,
  type Customer,
  type Delivery,
} from "@/lib/order-message";
import { InstagramIcon, WhatsAppIcon } from "../brand-icons";
import { buttonClass } from "../button-styles";
import { Modal } from "../Modal";
import { useOpenState } from "../use-open-state";
import { useCart } from "./cart-context";
import { Stepper } from "./Stepper";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} label="Tu pedido" variant="drawer">
      {open && <CartPanel onClose={onClose} />}
    </Modal>
  );
}

const inputClass =
  "mt-1.5 h-12 w-full rounded-2xl border-2 bg-white px-4 text-base outline-none transition placeholder:text-ink-soft/60 focus:border-ink";

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="mt-1 text-sm font-semibold text-red-700">
      {children}
    </p>
  );
}

function LineDetails({ line }: { line: ResolvedLine }) {
  const chosen = line.choices.filter(({ chosen }) => chosen.length > 0);
  if (chosen.length === 0 && !line.note) return null;
  return (
    <ul className="mt-0.5 space-y-0.5 text-sm text-ink-soft">
      {chosen.map(({ group, chosen: options }) => (
        <li key={group.id}>
          {group.title}: {options.map((option) => optionLabel(option)).join(", ")}
        </li>
      ))}
      {line.note && <li>Nota: {line.note}</li>}
    </ul>
  );
}

function CartPanel({ onClose }: { onClose: () => void }) {
  const { lines, count, total, checkout, setQty, remove, clear } = useCart();
  const openState = useOpenState(checkout.hours, checkout.timeZone);
  const ids = useId();

  const [customer, setCustomer] = useState<Customer>(() => {
    const saved = parseCustomer(customerStore.getSnapshot());
    return checkout.delivery ? saved : { ...saved, delivery: "recoger" };
  });
  const [comments, setComments] = useState("");
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "copied" | "copy-failed">("idle");
  const [message, setMessage] = useState("");

  const update = (patch: Partial<Customer>) =>
    setCustomer((current) => ({ ...current, ...patch }));

  const nameInvalid = customer.name.trim().length < 2;
  const addressInvalid =
    customer.delivery === "domicilio" && customer.address.trim().length < 5;
  const canSend = count > 0;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    if (nameInvalid || addressInvalid) {
      setTried(true);
      document
        .getElementById(`${ids}-${nameInvalid ? "name" : "address"}`)
        ?.focus();
      return;
    }

    customerStore.set(JSON.stringify(customer));
    const text = buildOrderMessage({
      lines,
      customer,
      comments,
      minutes: minutesNow(checkout.timeZone),
    });

    if (checkout.whatsapp) {
      window.open(
        `https://wa.me/${checkout.whatsapp}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );
      setStatus("sent");
      return;
    }

    // Sin número de WhatsApp configurado: se copia el pedido para pegarlo en el chat.
    setMessage(text);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("copy-failed");
    }
  };

  const deliveryOptions: { value: Delivery; label: string }[] = [
    ...(checkout.delivery
      ? [{ value: "domicilio" as const, label: "Domicilio" }]
      : []),
    { value: "recoger", label: "Recoger en el local" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-4xl font-extrabold uppercase leading-none">
          Tu pedido
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="grid size-11 place-items-center rounded-full border border-line transition hover:bg-brand-50"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="grid flex-1 place-items-center px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-brand-50 text-brand-600">
              <ShoppingBag className="size-9" aria-hidden="true" />
            </span>
            <p className="mt-5 font-display text-3xl font-bold uppercase">
              Aún no has agregado nada
            </p>
            <p className="mt-2 text-ink-soft">
              Toca el botón + junto a cada plato para armar tu pedido.
            </p>
            <a
              href="#menu"
              onClick={onClose}
              className={buttonClass("primary", "lg", "mt-6")}
            >
              Ver el menú
            </a>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
            {openState === "closed" && (
              <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sand px-4 py-3 text-[0.95rem] font-semibold">
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-brand-700" aria-hidden="true" />
                Ahora estamos cerrados. Abrimos a {formatTimeWithArticle(checkout.hours.open)}.
              </p>
            )}

            <ul className="divide-y divide-line">
              {lines.map((line) => {
                const ok = line.status === "ok";
                return (
                  <li key={line.key} className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`font-semibold leading-snug ${ok ? "" : "text-ink-soft line-through"}`}
                        >
                          {line.item.orderName}
                        </p>
                        <LineDetails line={line} />
                        {line.status === "unavailable" && (
                          <p className="mt-1 text-sm font-semibold text-red-700">
                            Agotado: no se incluye en el pedido.
                          </p>
                        )}
                        {line.status === "outdated" && (
                          <p className="mt-1 text-sm font-semibold text-red-700">
                            El menú cambió: quítalo y vuelve a agregarlo.
                          </p>
                        )}
                      </div>
                      {ok && (
                        <p className="text-right">
                          <span className="font-display text-2xl font-bold leading-none text-brand-700">
                            {formatCOP(line.total)}
                          </span>
                          {line.qty > 1 && (
                            <span className="block text-xs text-ink-soft">
                              {formatCOP(line.unitPrice)} c/u
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      {ok ? (
                        <Stepper
                          value={line.qty}
                          min={0}
                          onChange={(qty) => setQty(line.key, qty)}
                          label={line.item.name}
                        />
                      ) : (
                        <span />
                      )}
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="rounded-full px-3 py-2 text-sm font-semibold underline decoration-ink/30 underline-offset-4 transition hover:text-brand-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <section aria-labelledby={`${ids}-datos`} className="mt-2 border-t border-line pt-5">
              <h3
                id={`${ids}-datos`}
                className="font-display text-2xl font-bold uppercase tracking-wide"
              >
                Tus datos
              </h3>

              <div className="mt-3">
                <label htmlFor={`${ids}-name`} className="text-sm font-bold">
                  Nombre
                </label>
                <input
                  id={`${ids}-name`}
                  value={customer.name}
                  onChange={(event) => update({ name: event.target.value })}
                  autoComplete="name"
                  maxLength={80}
                  placeholder="¿A nombre de quién?"
                  aria-invalid={tried && nameInvalid}
                  aria-describedby={tried && nameInvalid ? `${ids}-name-error` : undefined}
                  className={`${inputClass} ${tried && nameInvalid ? "border-red-600" : "border-line"}`}
                />
                {tried && nameInvalid && (
                  <FieldError id={`${ids}-name-error`}>Escribe tu nombre.</FieldError>
                )}
              </div>

              <fieldset className="mt-4">
                <legend className="text-sm font-bold">¿Cómo lo recibes?</legend>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {deliveryOptions.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border-2 border-line bg-white px-3 text-center text-[0.95rem] font-bold transition has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink"
                    >
                      <input
                        type="radio"
                        name={`${ids}-delivery`}
                        value={value}
                        checked={customer.delivery === value}
                        onChange={() => update({ delivery: value })}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {customer.delivery === "domicilio" && (
                <div className="mt-4">
                  <label htmlFor={`${ids}-address`} className="text-sm font-bold">
                    Dirección de entrega
                  </label>
                  <input
                    id={`${ids}-address`}
                    value={customer.address}
                    onChange={(event) => update({ address: event.target.value })}
                    autoComplete="street-address"
                    maxLength={200}
                    placeholder="Calle, número, barrio, apartamento"
                    aria-invalid={tried && addressInvalid}
                    aria-describedby={tried && addressInvalid ? `${ids}-address-error` : undefined}
                    className={`${inputClass} ${tried && addressInvalid ? "border-red-600" : "border-line"}`}
                  />
                  {tried && addressInvalid && (
                    <FieldError id={`${ids}-address-error`}>
                      Escribe la dirección de entrega.
                    </FieldError>
                  )}
                </div>
              )}

              {checkout.payments.length > 0 && (
                <fieldset className="mt-4">
                  <legend className="text-sm font-bold">
                    ¿Cómo pagas?{" "}
                    <span className="font-semibold text-ink-soft">(opcional)</span>
                  </legend>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {checkout.payments.map((payment) => {
                      const selected = customer.payment === payment;
                      return (
                        <button
                          key={payment}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => update({ payment: selected ? "" : payment })}
                          className={`h-11 rounded-full border-2 px-4 text-[0.95rem] font-bold transition ${
                            selected
                              ? "border-ink bg-ink text-white"
                              : "border-line bg-white hover:border-ink/40"
                          }`}
                        >
                          {payment}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <div className="mt-4">
                <label htmlFor={`${ids}-comments`} className="text-sm font-bold">
                  Comentarios <span className="font-semibold text-ink-soft">(opcional)</span>
                </label>
                <textarea
                  id={`${ids}-comments`}
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder="Ej: tocar el timbre, traer cambio de $50.000"
                  className={`${inputClass} h-auto resize-none border-line py-3`}
                />
              </div>

              <p className="mt-3 text-xs text-ink-soft">
                Guardamos tu nombre y dirección solo en este dispositivo para que no
                tengas que escribirlos otra vez.
              </p>
            </section>
          </div>

          <div className="border-t border-line bg-white px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
            {status === "sent" && (
              <p className="mb-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                Se abrió WhatsApp con tu pedido. Envíalo desde allí.{" "}
                <button
                  type="button"
                  onClick={() => {
                    clear();
                    onClose();
                  }}
                  className="font-bold underline underline-offset-4"
                >
                  Ya lo envié, vaciar pedido
                </button>
              </p>
            )}
            {status === "copied" && (
              <p className="mb-3 flex items-start gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Pedido copiado. Pégalo en el chat de Instagram del restaurante.
              </p>
            )}
            {status === "copy-failed" && (
              <div className="mb-3">
                <label htmlFor={`${ids}-message`} className="text-sm font-bold">
                  Copia este texto y envíalo al restaurante:
                </label>
                <textarea
                  id={`${ids}-message`}
                  readOnly
                  value={message}
                  rows={5}
                  onFocus={(event) => event.currentTarget.select()}
                  className={`${inputClass} h-auto border-line py-3 text-sm`}
                />
              </div>
            )}

            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-ink-soft">
                Total · {count} {count === 1 ? "producto" : "productos"}
              </p>
              <p className="font-display text-4xl font-extrabold leading-none text-brand-700">
                {formatCOP(total)}
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSend}
              className={buttonClass("dark", "lg", "mt-3 w-full")}
            >
              {checkout.whatsapp ? (
                <>
                  <WhatsAppIcon className="size-5" />
                  Enviar pedido por WhatsApp
                </>
              ) : (
                <>
                  <Copy className="size-5" aria-hidden="true" />
                  Copiar mi pedido
                </>
              )}
            </button>

            {!checkout.whatsapp && checkout.instagramUrl && (
              <a
                href={checkout.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("light", "md", "mt-2 w-full border-2 border-line shadow-none")}
              >
                <InstagramIcon className="size-5" />
                Abrir chat de Instagram
                <span className="sr-only">(se abre en una pestaña nueva)</span>
              </a>
            )}

            <button
              type="button"
              onClick={clear}
              className="mx-auto mt-3 block rounded-full px-3 py-2 text-sm font-semibold text-ink-soft underline decoration-ink/30 underline-offset-4 transition hover:text-ink"
            >
              Vaciar pedido
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
