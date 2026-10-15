"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  Copy,
  Plus,
  ShoppingBag,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { matchZone } from "@/lib/barrios";
import { optionLabel, type ResolvedLine } from "@/lib/cart";
import { formatCOP, formatTimeWithArticle } from "@/lib/format";
import { customerStore } from "@/lib/local-store";
import type { DeliveryZone } from "@/lib/types";
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
import { BarrioField } from "./BarrioField";
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
  "mt-1.5 h-12 w-full rounded-2xl border-2 bg-white px-4 text-base outline-none transition placeholder:text-ink-soft/60 focus:border-brand-500";

const labelClass = "text-sm font-bold";

/** Un campo que abre el teclado. Los redondeles y las casillas no cuentan. */
const typesText = (target: EventTarget | null) =>
  (target instanceof HTMLInputElement &&
    !["radio", "checkbox", "submit", "button"].includes(target.type)) ||
  target instanceof HTMLTextAreaElement;

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
      {/*
        Con adicionales cobrados se muestra lo que vale el plato solo: si no, el "+$3.000" del
        adicional parece que se suma al precio de la línea, cuando ya está contado dentro.
      */}
      {line.unitPrice > line.item.price && (
        <li>Precio base: {formatCOP(line.item.price)}</li>
      )}
      {chosen.map(({ group, chosen: options }) => (
        <li key={group.id}>
          {group.title}: {options.map((choice) => optionLabel(choice)).join(", ")}
        </li>
      ))}
      {line.note && <li>Nota: {line.note}</li>}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Los dos pasos                                                       */
/* ------------------------------------------------------------------ */

type Step = 1 | 2;

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Tu pedido" },
  { n: 2, label: "Tus datos" },
];

/**
 * En qué paso va el pedido. El paso ya hecho se puede tocar para volver, que en el celular
 * se encuentra antes que la flecha de la cabecera.
 */
function StepBar({ step, onGo }: { step: Step; onGo: (step: Step) => void }) {
  return (
    <ol className="flex items-center border-b border-line px-5 py-3">
      {STEPS.map(({ n, label }, index) => {
        const done = step > n;
        const current = step === n;
        return (
          <li
            key={n}
            className={index === 0 ? "flex items-center" : "flex flex-1 items-center"}
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`mx-2.5 h-0.5 flex-1 rounded ${done || current ? "bg-brand-500" : "bg-line"}`}
              />
            )}
            <button
              type="button"
              onClick={() => done && onGo(n)}
              disabled={!done}
              aria-current={current ? "step" : undefined}
              className="flex items-center gap-2 rounded-full disabled:cursor-default"
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  done || current
                    ? "bg-brand-500 text-ink"
                    : "border-2 border-line text-ink-soft"
                }`}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : n}
              </span>
              <span
                className={`text-sm font-bold ${current ? "text-brand-700" : "text-ink-soft"}`}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* El carrito                                                          */
/* ------------------------------------------------------------------ */

function CartPanel({ onClose }: { onClose: () => void }) {
  const { lines, count, total, checkout, setQty, remove, clear } = useCart();
  const openState = useOpenState(checkout.hours, checkout.timeZone);
  const ids = useId();

  const [customer, setCustomer] = useState<Customer>(() =>
    parseCustomer(customerStore.getSnapshot()),
  );
  const [comments, setComments] = useState("");
  const [tried, setTried] = useState(false);
  const [wanted, setWanted] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "sent" | "copied" | "copy-failed">("idle");
  const [message, setMessage] = useState("");

  // Sin nada en el pedido no hay segundo paso al que ir.
  const step: Step = lines.length === 0 ? 1 : wanted;

  const update = (patch: Partial<Customer>) =>
    setCustomer((current) => ({ ...current, ...patch }));

  // Para recoger en el local no se piden dirección ni barrio y no se cobra domicilio.
  const delivering = customer.delivery === "domicilio";
  const zones = checkout.zones;
  const hasZones = zones.length > 0;

  // Barrio elegido: recién entonces el valor de su domicilio cuenta en el total.
  const [validatedId, setValidatedId] = useState<string | null>(() => {
    const saved = matchZone(parseCustomer(customerStore.getSnapshot()).barrio, checkout.zones);
    return saved.status === "ok" && saved.exact ? saved.zone.id : null;
  });
  // Se intentó enviar con un barrio que no está en la zona de domicilios.
  const [notFound, setNotFound] = useState(false);
  const validated = hasZones ? (zones.find((entry) => entry.id === validatedId) ?? null) : null;

  const pickZone = (zone: DeliveryZone) => {
    setValidatedId(zone.id);
    setNotFound(false);
    update({ barrio: zone.name });
  };
  /**
   * Red de seguridad al enviar: si escribió el nombre completo y no llegó a tocarlo en la lista,
   * se da por elegido igual, siempre que no haya duda de cuál es.
   */
  const resolveBarrio = (): DeliveryZone | null => {
    const result = matchZone(customer.barrio, zones);
    if (result.status === "ok") {
      pickZone(result.zone);
      return result.zone;
    }
    setValidatedId(null);
    setNotFound(true);
    return null;
  };
  const changeBarrio = (barrio: string) => {
    update({ barrio });
    setValidatedId(null);
    setNotFound(false);
  };

  const nameInvalid = customer.name.trim().length < 2;
  const addressInvalid = delivering && customer.address.trim().length < 5;
  const barrioMissing = delivering && customer.barrio.trim().length < 3;
  const canSend = count > 0;
  const shipping = delivering && validated ? { zone: validated.name, fee: validated.fee } : null;
  const grandTotal = total + (shipping?.fee ?? 0);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    // Primer paso: solo se pasa a los datos, todavía no se envía nada.
    if (step === 1) {
      setWanted(2);
      return;
    }

    // Si no llegó a tocar su barrio en la lista, se intenta reconocer aquí mismo.
    const zone = validated ?? (delivering && hasZones && !barrioMissing ? resolveBarrio() : null);
    const barrioInvalid = delivering && (barrioMissing || (hasZones && !zone));
    if (nameInvalid || barrioInvalid || addressInvalid) {
      setTried(true);
      const first = nameInvalid ? "name" : barrioInvalid ? "barrio" : "address";
      document.getElementById(`${ids}-${first}`)?.focus();
      return;
    }

    const order: Customer = { ...customer, barrio: zone ? zone.name : customer.barrio };
    customerStore.set(JSON.stringify(order));
    const text = buildOrderMessage({
      lines,
      customer: order,
      comments,
      shipping: delivering && zone ? { zone: zone.name, fee: zone.fee } : null,
      timeZone: checkout.timeZone,
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

  const deliveryOptions: { value: Delivery; label: string; icon: typeof Bike }[] = [
    { value: "domicilio", label: "Domicilio", icon: Bike },
    { value: "recoger", label: "Recoger en el local", icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-0 flex-auto flex-col">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        {step === 2 && (
          <button
            type="button"
            onClick={() => setWanted(1)}
            aria-label="Volver a tu pedido"
            className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full transition hover:bg-brand-50"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
        )}
        <h2 className="font-display text-4xl font-extrabold uppercase leading-none">
          Tu pedido
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="ml-auto grid size-11 shrink-0 place-items-center rounded-full border border-line transition hover:bg-brand-50"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="grid flex-auto place-items-center px-6 py-12 text-center">
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
        <>
          <StepBar step={step} onGo={setWanted} />

          <form
            noValidate
            onSubmit={submit}
            onFocusCapture={(event) => {
              if (!typesText(event.target)) return;
              // El teclado tarda en subir; recién después se centra el campo.
              const field = event.target as HTMLElement;
              window.setTimeout(
                () => field.scrollIntoView({ block: "center", behavior: "smooth" }),
                320,
              );
            }}
            className="flex min-h-0 flex-auto flex-col"
          >
            <div className="min-h-0 flex-auto overflow-y-auto overscroll-contain px-5 pb-6">
              {/* --------------------------------- Paso 1: el pedido */}
              {step === 1 && (
                <>
                  {openState === "closed" && (
                    <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sand px-4 py-3 text-[0.95rem] font-semibold">
                      <TriangleAlert
                        className="mt-0.5 size-5 shrink-0 text-brand-700"
                        aria-hidden="true"
                      />
                      Ahora estamos cerrados. Abrimos a{" "}
                      {formatTimeWithArticle(checkout.hours.open)}.
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
                              aria-label={`Quitar ${line.item.orderName} del pedido`}
                              className="grid size-11 place-items-center rounded-full border border-line text-ink-soft transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="size-5" aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <a
                    href="#menu"
                    onClick={onClose}
                    className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand-50 text-[0.95rem] font-bold text-brand-700 transition hover:bg-brand-100"
                  >
                    <Plus className="size-5" aria-hidden="true" />
                    Agregar más productos
                  </a>

                  <button
                    type="button"
                    onClick={clear}
                    className="mx-auto mt-4 block rounded-full px-3 py-2 text-sm font-semibold text-ink-soft underline decoration-ink/30 underline-offset-4 transition hover:text-ink"
                  >
                    Vaciar pedido
                  </button>
                </>
              )}

              {/* --------------------------------- Paso 2: los datos */}
              {step === 2 && (
                <div className="pt-4">
                  <fieldset className="min-w-0">
                    <legend className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-wide">
                      <Bike className="size-5 text-brand-700" aria-hidden="true" />
                      Tipo de entrega
                    </legend>
                    <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                      {deliveryOptions.map(({ value, label, icon: Icon }) => (
                        <label
                          key={value}
                          className="flex min-h-[5.5rem] cursor-pointer flex-col justify-between rounded-2xl border-2 border-line bg-white p-3.5 transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-500"
                        >
                          <input
                            type="radio"
                            name={`${ids}-delivery`}
                            value={value}
                            checked={customer.delivery === value}
                            onChange={() => update({ delivery: value })}
                            className="sr-only"
                          />
                          <Icon className="size-6 text-brand-600" aria-hidden="true" />
                          <span className="mt-2 text-[0.95rem] font-bold leading-snug">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                    {!delivering && (
                      <p className="mt-2 text-sm text-ink-soft">
                        Pasas a recogerlo al restaurante: sin domicilio y sin dirección.
                      </p>
                    )}
                  </fieldset>

                  <div className="mt-5">
                    <label htmlFor={`${ids}-name`} className={labelClass}>
                      Tu nombre
                    </label>
                    <input
                      id={`${ids}-name`}
                      value={customer.name}
                      onChange={(event) => update({ name: event.target.value })}
                      autoComplete="name"
                      maxLength={80}
                      placeholder="Ej: Juan Pérez"
                      aria-invalid={tried && nameInvalid}
                      aria-describedby={tried && nameInvalid ? `${ids}-name-error` : undefined}
                      className={`${inputClass} ${tried && nameInvalid ? "border-red-600" : "border-line"}`}
                    />
                    {tried && nameInvalid && (
                      <FieldError id={`${ids}-name-error`}>Escribe tu nombre.</FieldError>
                    )}
                  </div>

                  {delivering && (
                    <div className="mt-5">
                      <BarrioField
                        id={`${ids}-barrio`}
                        value={customer.barrio}
                        onChange={changeBarrio}
                        onPick={pickZone}
                        hasZones={hasZones}
                        zones={zones}
                        validated={validated}
                        showError={tried}
                        notFound={notFound}
                        inputClass={inputClass}
                      />
                    </div>
                  )}

                  {delivering && (
                    <div className="mt-5">
                      <label htmlFor={`${ids}-address`} className={labelClass}>
                        Dirección de entrega
                      </label>
                      <input
                        id={`${ids}-address`}
                        value={customer.address}
                        onChange={(event) => update({ address: event.target.value })}
                        autoComplete="street-address"
                        maxLength={200}
                        placeholder="Calle, número, apartamento"
                        aria-invalid={tried && addressInvalid}
                        aria-describedby={
                          tried && addressInvalid ? `${ids}-address-error` : undefined
                        }
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
                    <fieldset className="mt-5">
                      <legend className={labelClass}>
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
                                  ? "border-brand-500 bg-brand-500 text-ink"
                                  : "border-line bg-white hover:border-brand-300"
                              }`}
                            >
                              {payment}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

                  <div className="mt-5">
                    <label htmlFor={`${ids}-comments`} className={labelClass}>
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

                  {/*
                    El desglose va aquí y no en el pie: así el pie se queda en dos renglones y
                    no se come la pantalla cuando sale el teclado del celular.
                  */}
                  <dl className="mt-6 space-y-1.5 rounded-2xl bg-cream px-4 py-3.5">
                    {delivering && hasZones && (
                      <>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                            Total productos · {count}
                          </dt>
                          <dd className="font-display text-xl font-bold leading-none">
                            {formatCOP(total)}
                          </dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-3">
                          <dt className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                            Domicilio{validated ? ` · ${validated.name}` : ""}
                          </dt>
                          <dd
                            className={
                              validated
                                ? "font-display text-xl font-bold leading-none"
                                : "text-sm font-semibold text-amber-800"
                            }
                          >
                            {validated ? formatCOP(validated.fee) : "Falta elegir el barrio"}
                          </dd>
                        </div>
                      </>
                    )}
                    <div
                      className={`flex items-baseline justify-between gap-3 ${
                        delivering && hasZones ? "border-t border-line pt-2" : ""
                      }`}
                    >
                      <dt className="text-sm font-bold uppercase tracking-[0.14em]">
                        Total a pagar
                      </dt>
                      <dd className="font-display text-3xl font-extrabold leading-none text-brand-700">
                        {formatCOP(grandTotal)}
                      </dd>
                    </div>
                  </dl>
                  {delivering && !hasZones && (
                    <p className="mt-1.5 text-xs font-semibold text-amber-800">
                      Más el domicilio, que te confirmamos por WhatsApp.
                    </p>
                  )}

                  <p className="mt-4 text-xs text-ink-soft">
                    Guardamos tu nombre y dirección solo en este dispositivo para que no tengas
                    que escribirlos otra vez.
                  </p>
                </div>
              )}
            </div>

            {/* ------------------------- Pie: el total y el botón del paso */}
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
                  <label htmlFor={`${ids}-message`} className={labelClass}>
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
                  Total
                </p>
                <p className="font-display text-3xl font-extrabold leading-none text-brand-700">
                  {formatCOP(step === 1 ? total : grandTotal)}
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSend}
                className={buttonClass("dark", "lg", "mt-3 w-full")}
              >
                {step === 1 ? (
                  <>
                    Continuar
                    <ArrowRight className="size-5" aria-hidden="true" />
                  </>
                ) : checkout.whatsapp ? (
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

              {step === 2 && !checkout.whatsapp && checkout.instagramUrl && (
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
            </div>
          </form>
        </>
      )}
    </div>
  );
}
