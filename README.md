# Restaurante La Mona — sitio web

Página del restaurante: portada con dos caminos (**ver el menú** o **pedir a domicilio**), menú con precios,
**carrito que suma el pedido, cobra el domicilio por barrio y lo envía por WhatsApp**, horario, medios de pago
y ventana de promoción. Funciona en celular, tablet y computador. Hecha con **Next.js 16**
(App Router), **Tailwind CSS 4** y TypeScript; lista para desplegar en **Vercel**.

## Ver el sitio en tu computador

Necesitas Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. Los cambios se ven al guardar el archivo.

## Las páginas del sitio

| Dirección     | Qué es                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/`           | Portada: "¿Qué quieres hacer?" con dos opciones, **Ver el menú** y **Pedir a domicilio**.                                                |
| `/menu`       | La carta del local, solo para ver (sin carrito) y con los **precios del local**. Es la dirección del **código QR** que va en las mesas. |
| `/domicilios` | Para pedir: carrito, **precios de domicilio** (cada producto cuesta un recargo más), barrio y envío por WhatsApp. También se puede **recoger en el local**. |
| `/admin`      | Panel del restaurante. Se entra tocando el logo del pie de página.                                                                      |

## Dónde se cambia cada cosa

Los precios, los platos, las fotos, el horario y la promoción se editan desde el [panel
administrativo](#panel-administrativo), sin tocar código. Los archivos de `src/data` son el respaldo y el
contenido inicial; lo de abajo aplica cuando todavía no hay panel conectado o quieres cambiar el diseño.

| Qué                                                                  | Archivo                                                         |
| -------------------------------------------------------------------- | --------------------------------------------------------------- |
| Platos, precios, categorías y opciones (acompañantes, adicionales)   | `src/data/menu.ts`                                              |
| WhatsApp, horario, Instagram, dirección, medios de pago, promoción   | `src/data/site.ts`                                              |
| Colores (tomados del menú impreso)                                   | `src/app/globals.css`, bloque `@theme`                          |
| Tipografías                                                          | `src/app/layout.tsx`                                            |
| Logo                                                                 | `public/logo.png`, `src/app/icon.png`, `src/app/apple-icon.png` |

Los precios se escriben sin puntos (`8000` se muestra como `$8.000`). Ejemplo de un plato nuevo:

```ts
{ name: "Lomo de res", price: 18000, description: "Con papas criollas" },
```

Para ocultar un plato por un rato sin borrarlo: `available: false` (se muestra como "Agotado" y no se puede pedir).

## Carrito y pedido por WhatsApp

Cada plato tiene un botón **+** que abre su ventana: foto, precio, lo que haya que elegir (acompañante, agua o
leche, adicionales), una nota y la cantidad. Siempre se abre, también en gaseosas o fritos, para poder ajustar
cantidad y nota antes de agregar.
El carrito solo existe en `/domicilios` (en `/menu` no hay botones para pedir). En **Mi pedido** el cliente
escribe su nombre y elige **Domicilio** o **Recoger en el local**. A domicilio escribe además su **barrio** (se valida
y se suma el domicilio) y la dirección; para recoger no se piden dirección ni barrio y no se cobra domicilio. Luego
el medio de pago si quiere y comentarios, y al pulsar **Enviar pedido por WhatsApp** se abre el chat del restaurante
con el mensaje ya escrito (el de abajo es el de un domicilio):

```
Hola, buenos días 👋 Quisiera hacer este pedido:

🗓️ 02/10/2026 · ⏰ 8:05 a.m.

*Tipo de servicio:* Domicilio
*Nombre:* Juan Pérez
*Barrio:* San Isidro
*Dirección:* Calle 10 # 5-20, apto 301

*📝 Pedido*
*2 x Huevo perico* — $30.000
   • Acompañante: Yuca
   • Adicionales: 2 x Papas fritas (+$6.000 c/u)
   • Nota: sin cebolla
*1 x Mora (Jugos batidos)* — $7.000
   • Prepáralo en: Leche

*💬 Comentarios*
Tocar el timbre

*💲 Pago*
Medio de pago: Bancolombia
Total factura: $37.000
Domicilio (San Isidro): $5.000
*Total a pagar: $42.000*
```

- El saludo cambia según la hora de Colombia (buenos días / buenas tardes / buenas noches). El formato se edita en
  `buildOrderMessage`, en `src/lib/order-message.ts`.
- El pedido se guarda en el navegador del cliente (solo qué plato, opciones y cantidad). Los precios se calculan siempre
  con el menú vigente: si cambias un precio o marcas un plato como agotado, el carrito del cliente se actualiza solo.
- Cuando se agregan opciones a un plato, se definen en la categoría (`options` en `src/data/menu.ts`): una opción con
  `price` suma ese valor; sin `price` va incluida. `required: true` obliga a elegir; `multiple: true` permite marcar varias; `counted: true` muestra un contador para pedir varias unidades (ej. 2 adicionales de chorizo, cada uno suma su precio; la cantidad también se puede escribir, ej. 15).
  Todo lo que se cobra aparte (papas fritas, cayeye, queso, chicharrón…) va en un grupo `counted`; lo que viene incluido y se elige una sola vez (yuca, patacones…) va en un grupo normal.
- Sin número de WhatsApp configurado, el carrito ofrece **Copiar mi pedido** para pegarlo en el chat de Instagram.

## Domicilios: precios y barrios

- **Precios de domicilio.** Cada producto cuesta `deliverySurcharge` pesos más que en el menú del local (hoy
  **$1.000**). Se suma al precio de cada plato y al precio único de una categoría (los batidos); los adicionales
  (papas, cayeye…) no cambian. En `/menu` siempre se ven los precios del local. Se cambia en el panel
  (pestaña *Domicilios*) o en `src/data/site.ts`. Quien elige *Recoger en el local* ve los mismos precios de esta
  página, pero sin domicilio.
- **Los barrios viven en la base de datos**, en la tabla `delivery_zones` de Supabase (nombre y valor), no en el
  código. Se editan en el panel, pestaña *Domicilios*, con una línea por barrio: `San Isidro - 5000` (se puede
  pegar la lista completa; también sirven los dos puntos, la coma o pegar desde Excel; lo que se quita de la lista
  se quita del sitio). También se pueden cargar directo en Supabase: *Table Editor → delivery_zones → Insert →
  Import data from CSV* (columnas `name` y `fee`).
- **Crear la tabla (una sola vez):** el SQL está en `supabase/schema.sql`, sección *Barrios de domicilio*. Si todavía
  no existe, el panel lo muestra listo para copiar y el sitio funciona igual, sin pedir el barrio.
- **El cliente puede escribir el barrio "como sea".** Se compara por cómo suena en español, no por cómo se escribe:
  `san isidro`, `sanisidro`, `SANSISDRO`, `SANISISdro`, `Barrio San Isidro`, con tildes o sin ellas, con b/v, s/z/c o h
  de más o de menos. Al reconocerlo, el campo queda con el nombre oficial y se muestra el valor del domicilio.
  Si hay dudas (`isidro` puede ser *San Isidro* o *San Isidro II*) se ofrecen botones para tocar el correcto, y si
  el barrio no existe no deja enviar el pedido.
- **Totales:** *Total factura* (productos), *Domicilio* (valor del barrio) y *Total a pagar*; el mensaje de WhatsApp
  trae el mismo desglose. Para recoger solo hay un total.
- Mientras la tabla esté vacía (o no exista), el carrito no pide el barrio ni suma domicilio.
- Código: `src/lib/barrios.ts` (reconocimiento, lectura de la lista y sincronización con la tabla),
  `src/lib/delivery.ts` (recargo), `src/components/cart/BarrioField.tsx` (el campo) y
  `src/app/admin/_components/DeliveryForms.tsx` (el panel).

## Ventana de promoción

Una imagen que aparece sola cuando alguien entra al sitio. Al cerrarla no vuelve a salir en ese navegador
hasta que cambie el `id` de la promoción o la persona borre los datos del sitio. Se edita en el panel
administrativo (pestaña **Ajustes**); sin panel, en `src/data/site.ts`:

```ts
promo: {
  active: true,                 // false la apaga
  id: "promo-oct-2026",         // cámbialo con cada promoción nueva para que la vuelvan a ver
  image: "/promo.jpg",          // archivo dentro de /public
  alt: "2x1 en desayunos hasta el viernes",
  cta: { label: "Ver el menú", href: "#menu" },   // botón opcional
},
```

## Pendiente por completar

Estos datos no estaban en la imagen del menú, por eso no aparecen todavía:

- **Barrios con domicilio y su valor:** crear la tabla (SQL en `supabase/schema.sql`) y cargar la lista del
  restaurante en el panel, pestaña *Domicilios*.
- **Dirección, teléfono y enlace de Google Maps** (`address`, `phone`, `mapsUrl`). Al llenarlos aparecen
  solos en la franja de información y en el pie de página.
- **Horario**: el menú dice "5:00 a.m. a 1:00 a.m."; confirma si el cierre es a la 1:00 a.m. o a la 1:00 p.m.
  y ajusta `hours` en `src/data/site.ts`. El aviso "Abierto ahora / Cerrado ahora" se calcula con ese horario.
- **Dedito pequeño**: en el menú aparece como "$7.00"; se cargó como `$7.000`. Confirma el precio.
- **Logo**: se recortó de la imagen del menú (baja resolución). Reemplaza `public/logo.png` por el archivo original.

## Fotos

Desde el panel administrativo se suben con el botón **Subir foto** de cada plato, categoría o de la portada;
quedan guardadas en Supabase Storage. Sin panel, copia las imágenes a `public/menu/` y referéncialas:

```ts
{ name: "Lomo asado", price: 15000, image: "/menu/lomo-asado.jpg" }   // foto del plato
{ id: "asados", ..., image: "/menu/asados.jpg" }                      // foto grande de la categoría (escritorio)
```

En `src/data/site.ts`, `heroImage: "/portada.jpg"` pone una foto en la portada. Next.js redimensiona y
comprime las imágenes solo, así que se pueden subir fotos tomadas con el celular.

Si algún día usas otro servicio de almacenamiento, agrega su dominio en `next.config.ts` →
`images.remotePatterns` (Supabase y Vercel Blob ya están incluidos).

## Desplegar en Vercel

1. Crea un repositorio en GitHub y sube el proyecto:
   ```bash
   git init
   git add .
   git commit -m "Sitio Restaurante La Mona"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/restaurante-la-mona.git
   git push -u origin main
   ```
2. En [vercel.com/new](https://vercel.com/new) importa ese repositorio. Vercel detecta Next.js solo; no hay
   que cambiar ninguna configuración. Pulsa **Deploy**.
3. Desde ahí, cada `git push` a `main` publica la nueva versión automáticamente.
4. Dominio propio: *Settings → Domains*. Después crea la variable de entorno `NEXT_PUBLIC_SITE_URL`
   (ej. `https://restlamona22.com`) para que el enlace compartido en WhatsApp y el QR usen ese dominio (más abajo, la guía completa).

Sin GitHub también se puede: `npx vercel` desde esta carpeta.

### Dominio `restlamona22.com` (comprado en Cloudflare)

1. **Comprarlo:** en [dash.cloudflare.com](https://dash.cloudflare.com), *Domain Registration → Register Domains*,
   busca `restlamona22.com` y cómpralo (Cloudflare lo vende al costo y el dominio queda en su DNS).
2. **Agregarlo a Vercel:** en el proyecto, *Settings → Domains → Add*, escribe `restlamona22.com` (y también
   `www.restlamona22.com`, que se redirige al principal). Vercel muestra los registros DNS exactos que necesita.
3. **Crear esos registros en Cloudflare:** *DNS → Records → Add record*, copiando lo que dice Vercel (normalmente un
   registro `A` con nombre `@` y un `CNAME` con nombre `www`). Deja la nube en **gris ("Solo DNS")**, no naranja,
   al menos hasta que Vercel marque el dominio como válido; el certificado HTTPS lo emite Vercel solo.
4. **Avisarle al sitio cuál es su dirección:** en Vercel, *Settings → Environment Variables*, crea
   `NEXT_PUBLIC_SITE_URL` con el valor `https://restlamona22.com` y vuelve a desplegar. Esa variable la usan los
   enlaces compartidos, el mapa del sitio y el **código QR**.
5. **El QR:** en el panel, pestaña *Código QR*, ya sale con `https://restlamona22.com/menu`. Se imprime desde ahí.
   Hazlo después del paso 4: mientras el sitio no tenga su dominio, el QR apunta a una dirección de prueba.

## Panel administrativo

Desde el celular, en `/admin` (o tocando el logo del pie de página), se editan precios, platos agotados,
fotos, horario, contacto y la promoción. Cada vez que guardas, el sitio se actualiza al instante.

El contenido vive en **Supabase**: el menú y los datos del restaurante en la tabla `content` (dos filas,
`menu` y `site`, con la misma forma de `src/lib/types.ts`) y las fotos en el bucket `menu` de Supabase
Storage. Si Supabase no está configurado, el sitio sigue funcionando con los archivos de `src/data` y el
panel muestra las instrucciones de configuración.

### Conectarlo (una sola vez)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. Abre **SQL Editor**, pega el archivo [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
   Eso crea la tabla, los permisos y el bucket de fotos.
3. **Authentication → Users → Add user**: tu correo y una contraseña, marcando *Auto Confirm User*.
   En **Authentication → Providers → Email** desactiva *Enable sign ups*, para que nadie más se registre.
4. Copia las llaves con el botón **Connect** de arriba, o en **Settings → API Keys**. Necesitas la
   dirección del proyecto y la llave **publishable** (empieza por `sb_publishable_`; la *secret* no se
   comparte nunca). Van a un archivo `.env.local` — hay plantilla en [`.env.example`](.env.example):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   ```

   En Vercel, las mismas en *Settings → Environment Variables*, y vuelve a desplegar.
5. Entra a `/admin`, inicia sesión y pulsa **Copiar el menú actual a Supabase**. A partir de ahí el menú se
   edita desde el panel y los archivos de `src/data` quedan solo como respaldo.

### Código QR de las mesas

En el panel, pestaña **Código QR**: muestra una tarjeta lista para imprimir (logo, "Escanea y mira nuestro menú" y
el QR) con botones para imprimir o guardar en PDF y descargar el PNG o el SVG. El QR abre `/menu` y no cambia
aunque se cambien precios o platos. Si el sitio todavía no tiene su dominio definitivo, la página avisa que no se
imprima aún.

### Cómo está hecho

- `src/lib/content.ts` es el único punto de lectura (`getMenu()` y `getSite()`): intenta Supabase y, si no
  hay nada guardado o falla, devuelve los archivos de `src/data`. Lo guardado pasa antes por
  `src/lib/content-schema.ts`, que descarta o corrige lo que tenga mal la forma, para que un dato dañado
  nunca rompa la página pública.
- Al guardar se llama `revalidatePath("/")`, por eso el cambio se publica de inmediato. Sin eso, la página
  se regenera sola cada 10 minutos (`revalidate` en `src/app/page.tsx`).
- Las fotos se reducen en el navegador (máx. 1600 px, WebP; `src/lib/image.ts`) y se suben directo a Supabase
  Storage, sin pasar por el servidor; así se pueden tomar con el celular, no estorba el límite de tamaño de
  Vercel y rinde el espacio gratis. El dominio ya está permitido en `next.config.ts`.
- `src/proxy.ts` mantiene viva la sesión del panel. Solo corre en `/admin`.
- Precios: se escriben o se suben y bajan de a $500 con los botones − y +. Los platos se ordenan con las
  flechas de cada uno y las categorías con *Subir* / *Bajar*.
- **Opciones al pedir** (acompañante, adicionales, agua o leche) y los "incluidos" se editan en cada categoría,
  en *Opciones al pedir*, sin tocar código. Cada grupo se elige de una de tres formas: una sola opción,
  varias, o **con cantidad** (botones + y −, para pedir 2 de queso o 10 de papas). Todo lo que se cobra
  aparte conviene dejarlo "con cantidad". El editor avisa si un grupo tiene precios y no lleva cantidad.
- El WhatsApp se puede escribir con o sin el 57 de Colombia (`3019629614` o `573019629614`).

## Comandos

| Comando         | Qué hace                                        |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo                          |
| `npm run build` | Compila la versión de producción                |
| `npm run start` | Sirve la versión compilada                      |
| `npm run lint`  | Revisa el código                                |
