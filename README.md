# Restaurante La Mona — sitio web

Página del restaurante: menú con precios, **carrito que suma el pedido y lo envía por WhatsApp**, horario,
medios de pago y ventana de promoción. Funciona en celular, tablet y computador. Hecha con **Next.js 16**
(App Router), **Tailwind CSS 4** y TypeScript; lista para desplegar en **Vercel**.

## Ver el sitio en tu computador

Necesitas Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. Los cambios se ven al guardar el archivo.

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
El total se suma solo. En **Mi pedido** el cliente escribe su nombre, elige domicilio o recoger (con dirección),
el medio de pago si quiere y comentarios, y al pulsar **Enviar pedido por WhatsApp** se abre el chat del
restaurante con el mensaje ya escrito:

```
Hola, buenos días. Quisiera hacer este pedido:

2 x Huevo perico — $24.000
   Acompañantes: Papas fritas (+$3.000 c/u)
   Nota: sin cebolla
1 x Mora (Jugos batidos) — $7.000
   Prepáralo en: Leche

*Total: $31.000*

Nombre: Juan Pérez
Entrega: Domicilio
Dirección: Calle 10 # 5-20, apto 301
Pago: Bancolombia
```

- El saludo cambia según la hora de Colombia (buenos días / buenas tardes / buenas noches). Se edita en
  `greetingFor` y `buildOrderMessage`, en `src/lib/order-message.ts`.
- El pedido se guarda en el navegador del cliente (solo qué plato, opciones y cantidad). Los precios se calculan siempre
  con el menú vigente: si cambias un precio o marcas un plato como agotado, el carrito del cliente se actualiza solo.
- Cuando se agregan opciones a un plato, se definen en la categoría (`options` en `src/data/menu.ts`): una opción con
  `price` suma ese valor; sin `price` va incluida. `required: true` obliga a elegir; `multiple: true` permite marcar varias.
- Sin número de WhatsApp configurado, el carrito ofrece **Copiar mi pedido** para pegarlo en el chat de Instagram.

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

- **Número de WhatsApp** (`whatsapp` en `src/data/site.ts`, con indicativo, ej. `"573001234567"`).
  Es el destino de los pedidos del carrito; sin él no se pueden enviar.
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
   (ej. `https://lamona.com.co`) para que el enlace compartido en WhatsApp use ese dominio.

Sin GitHub también se puede: `npx vercel` desde esta carpeta.

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
4. Copia las dos llaves de **Project Settings → API** a un archivo `.env.local` (hay una plantilla en
   [`.env.example`](.env.example)):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   ```

   En Vercel, las mismas en *Settings → Environment Variables*, y vuelve a desplegar.
5. Entra a `/admin`, inicia sesión y pulsa **Copiar el menú actual a Supabase**. A partir de ahí el menú se
   edita desde el panel y los archivos de `src/data` quedan solo como respaldo.

### Cómo está hecho

- `src/lib/content.ts` es el único punto de lectura (`getMenu()` y `getSite()`): intenta Supabase y, si no
  hay nada guardado o falla, devuelve los archivos de `src/data`.
- Al guardar se llama `revalidatePath("/")`, por eso el cambio se publica de inmediato. Sin eso, la página
  se regenera sola cada 10 minutos (`revalidate` en `src/app/page.tsx`).
- Las fotos se suben desde el navegador directo a Supabase Storage, sin pasar por el servidor; así no
  estorba el límite de tamaño de Vercel. El dominio ya está permitido en `next.config.ts`.
- `src/proxy.ts` mantiene viva la sesión del panel. Solo corre en `/admin`.
- Las opciones al pedir (acompañantes, adicionales, agua o leche) y los "incluidos" se editan como JSON,
  dentro de *Avanzado* en cada categoría: cambian poco y no valía la pena un formulario entero.

## Comandos

| Comando         | Qué hace                                        |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo                          |
| `npm run build` | Compila la versión de producción                |
| `npm run start` | Sirve la versión compilada                      |
| `npm run lint`  | Revisa el código                                |
