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

Cada plato tiene un botón **+**. Los que no tienen nada que elegir (fritos, jugos, gaseosas) se agregan de una vez;
los demás abren una ventana para elegir (acompañante, agua o leche, adicionales), poner una nota y la cantidad.
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
hasta que cambie el `id` de la promoción o la persona borre los datos del sitio. En `src/data/site.ts`:

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

Por ahora, copia las imágenes a `public/menu/` y referéncialas:

```ts
{ name: "Lomo asado", price: 15000, image: "/menu/lomo-asado.jpg" }   // foto del plato
{ id: "asados", ..., image: "/menu/asados.jpg" }                      // foto grande de la categoría (escritorio)
```

En `src/data/site.ts`, `heroImage: "/portada.jpg"` pone una foto en la portada. Next.js redimensiona y
comprime las imágenes solo, así que se pueden subir fotos tomadas con el celular.

Cuando las fotos las suba el panel administrativo desde un servicio externo, agrega su dominio en
`next.config.ts` → `images.remotePatterns` (Vercel Blob ya está incluido).

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

## Panel administrativo (todavía no existe)

Hoy los cambios (precios, platos agotados, promoción, fotos) se hacen editando `src/data/menu.ts` y
`src/data/site.ts` y volviendo a publicar. El sitio ya está preparado para conectar un panel, pero el panel
(login, formularios, carga de fotos) está por construirse.

El sitio lee todo el contenido desde un único lugar, `src/lib/content.ts` (`getMenu()` y `getSite()`),
que hoy devuelve los archivos de `src/data`. Para conectar el panel:

1. Guarda el menú y los datos del sitio (incluida la promoción) en una base de datos con la misma forma de
   `src/lib/types.ts`, y las fotos en un almacenamiento (Vercel Blob, Supabase Storage).
2. Reemplaza el cuerpo de `getMenu()` y `getSite()` para consultar esa base. La página y los componentes no cambian.
3. Cuando el administrador guarde un cambio, llama a `revalidatePath("/")` en su acción para publicarlo al instante.
   Mientras tanto, la página se actualiza sola cada 10 minutos (`revalidate` en `src/app/page.tsx`).

## Comandos

| Comando         | Qué hace                                        |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Servidor de desarrollo                          |
| `npm run build` | Compila la versión de producción                |
| `npm run start` | Sirve la versión compilada                      |
| `npm run lint`  | Revisa el código                                |
