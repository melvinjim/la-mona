import type { Metadata } from "next";
import { getContentSources, getMenu } from "@/lib/content";
import { CategoryForm } from "../_components/CategoryForm";
import { ImportBanner } from "../_components/ImportBanner";
import { NewCategoryForm } from "../_components/NewCategoryForm";

export const metadata: Metadata = {
  title: "Menú",
  robots: { index: false, follow: false },
};

export default async function MenuAdminPage() {
  const [menu, sources] = await Promise.all([getMenu(), getContentSources()]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-4xl font-extrabold uppercase leading-none">
          Menú
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Cada cambio que guardes se publica en el sitio de inmediato.
        </p>
      </div>

      {sources.menu === "archivos" && <ImportBanner />}

      <div className="space-y-3">
        {menu.map((category, index) => (
          <CategoryForm
            key={category.id}
            category={category}
            index={index}
            total={menu.length}
          />
        ))}
      </div>

      <NewCategoryForm />
    </div>
  );
}
