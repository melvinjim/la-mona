import { CartBar } from "@/components/cart/CartBar";
import { CartProvider } from "@/components/cart/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InfoStrip } from "@/components/InfoStrip";
import { MenuSection } from "@/components/MenuSection";
import { MenuShell } from "@/components/MenuShell";
import { PromoModal } from "@/components/PromoModal";
import { buildCatalog } from "@/lib/cart";
import { getMenu, getSite } from "@/lib/content";
import { getChatLink, whatsappDigits } from "@/lib/order";

// La página se regenera sola cada 10 minutos; con el panel administrativo se puede
// forzar al instante con revalidatePath("/").
export const revalidate = 600;

export default async function Home() {
  const [menu, site] = await Promise.all([getMenu(), getSite()]);
  const chat = getChatLink(site);
  const catalog = buildCatalog(menu);
  const nav = menu.map(({ id, name, navLabel, icon, items }) => ({
    id,
    label: navLabel ?? name,
    icon,
    count: items.length,
  }));

  return (
    <CartProvider
      catalog={catalog}
      checkout={{
        whatsapp: whatsappDigits(site),
        instagramUrl: site.instagram
          ? `https://ig.me/m/${site.instagram}`
          : undefined,
        delivery: site.delivery,
        payments: site.payments,
        hours: site.hours,
        timeZone: site.timeZone,
      }}
    >
      <a
        href="#menu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:font-bold focus:text-white"
      >
        Saltar al menú
      </a>

      <Header site={site} />

      <main>
        <Hero site={site} menu={menu} chat={chat} />
        <InfoStrip site={site} />

        <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-8">
          <p className="font-display text-base font-bold uppercase tracking-[0.22em] text-brand-700">
            Carta
          </p>
          <h2 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">
            Nuestro menú
          </h2>
          <p className="mt-3 max-w-xl text-lg text-ink-soft">
            Toca el botón + para agregar a tu pedido; el total se suma solo y lo
            envías por WhatsApp. Precios en pesos colombianos.
          </p>
        </div>

        <MenuShell categories={nav}>
          {menu.map((category) => (
            <MenuSection key={category.id} category={category} />
          ))}
        </MenuShell>
      </main>

      <Footer site={site} chat={chat} />
      <CartBar />
      <PromoModal promo={site.promo} />
    </CartProvider>
  );
}
