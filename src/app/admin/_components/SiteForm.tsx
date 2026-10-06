"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/types";
import { saveSite, type FormState } from "../actions";
import { ImageField } from "./ImageField";
import { SubmitButton } from "./SubmitButton";
import { Alert, Card, Field, inputClass, restore, Toggle } from "./ui";

export function SiteForm({ site }: { site: SiteSettings }) {
  const [state, action] = useActionState<FormState, FormData>(saveSite, {});
  const old = restore(state.values);
  const promo = site.promo;

  return (
    <form action={action} className="space-y-5">
      <Card title="El restaurante">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre corto">
            <input
              name="name"
              defaultValue={old.text("name", site.name)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Nombre completo">
            <input
              name="fullName"
              defaultValue={old.text("fullName", site.fullName)}
              required
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descripción" hint="Sale en Google y al compartir el enlace.">
              <textarea
                name="description"
                defaultValue={old.text("description", site.description)}
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>
          <ImageField name="logo" label="Logo" defaultValue={site.logo} />
          <ImageField
            name="heroImage"
            label="Foto de portada"
            hint="Opcional, se ve arriba del todo."
            defaultValue={site.heroImage ?? ""}
          />
        </div>
      </Card>

      <Card title="Contacto y pedidos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="WhatsApp"
            hint="Solo dígitos. Si escribes el celular de 10 dígitos se le agrega el 57 de Colombia. Ahí llegan los pedidos."
          >
            <input
              name="whatsapp"
              inputMode="numeric"
              defaultValue={old.text("whatsapp", site.whatsapp)}
              placeholder="3019629614"
              className={inputClass}
            />
          </Field>
          <Field label="Instagram" hint="Sin la arroba.">
            <input
              name="instagram"
              defaultValue={old.text("instagram", site.instagram)}
              placeholder="restlamona22"
              className={inputClass}
            />
          </Field>
          <Field label="Teléfono">
            <input
              name="phone"
              defaultValue={old.text("phone", site.phone)}
              className={inputClass}
            />
          </Field>
          <Field label="Dirección">
            <input
              name="address"
              defaultValue={old.text("address", site.address)}
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Enlace de Google Maps">
              <input
                name="mapsUrl"
                type="url"
                defaultValue={old.text("mapsUrl", site.mapsUrl)}
                placeholder="https://maps.app.goo.gl/..."
                className={inputClass}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Mensaje del botón de chat"
              hint='Lo que aparece escrito al abrir el chat desde "Escribir por WhatsApp".'
            >
              <input
                name="chatMessage"
                defaultValue={old.text("chatMessage", site.chatMessage)}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Horario y pagos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Abre" hint="Formato de 24 horas.">
            <input
              name="hoursOpen"
              type="time"
              defaultValue={old.text("hoursOpen", site.hours.open)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Cierra" hint="Si es menor que la de apertura, cierra al otro día.">
            <input
              name="hoursClose"
              type="time"
              defaultValue={old.text("hoursClose", site.hours.close)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Zona horaria">
            <input
              name="timeZone"
              defaultValue={old.text("timeZone", site.timeZone)}
              className={inputClass}
            />
          </Field>
          <div className="self-end">
            <Toggle
              name="delivery"
              label="Hacemos domicilios"
              defaultChecked={old.flag("delivery", site.delivery)}
            />
          </div>
          <Field label="Medios de pago" hint="Separados por comas.">
            <input
              name="payments"
              defaultValue={old.text("payments", site.payments.join(", "))}
              placeholder="Bancolombia, Davivienda, Llave"
              className={inputClass}
            />
          </Field>
          <Field label="No recibimos" hint="Separados por comas. Vacío si recibes todo.">
            <input
              name="notAccepted"
              defaultValue={old.text("notAccepted", (site.notAccepted ?? []).join(", "))}
              placeholder="Nequi"
              className={inputClass}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Promoción"
        description="Ventana que se abre una sola vez a quien entra al sitio."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageField
              name="promoImage"
              label="Imagen de la promoción"
              defaultValue={promo?.image ?? ""}
            />
          </div>
          <Field
            label="Identificador"
            hint="Cámbialo con cada promoción nueva para que se vuelva a mostrar."
          >
            <input
              name="promoId"
              defaultValue={old.text("promoId", promo?.id ?? "promo-1")}
              className={inputClass}
            />
          </Field>
          <Field label="Texto alternativo" hint="Describe la imagen, para accesibilidad.">
            <input
              name="promoAlt"
              defaultValue={old.text("promoAlt", promo?.alt)}
              className={inputClass}
            />
          </Field>
          <Field label="Texto del botón" hint="Opcional.">
            <input
              name="promoCtaLabel"
              defaultValue={old.text("promoCtaLabel", promo?.cta?.label)}
              placeholder="Ver el menú"
              className={inputClass}
            />
          </Field>
          <Field label="Enlace del botón" hint='Puede ser "#menu".'>
            <input
              name="promoCtaHref"
              defaultValue={old.text("promoCtaHref", promo?.cta?.href)}
              placeholder="#menu"
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <Toggle
              name="promoActive"
              label="Mostrar la promoción al entrar"
              defaultChecked={old.flag("promoActive", promo?.active ?? false)}
            />
          </div>
        </div>
      </Card>

      <Alert state={state} />

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-cream/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <SubmitButton>Guardar y publicar</SubmitButton>
      </div>
    </form>
  );
}
