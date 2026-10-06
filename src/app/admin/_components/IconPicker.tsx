"use client";

import { categoryIcons } from "@/components/category-icons";
import type { CategoryIcon } from "@/lib/types";
import { ChoiceGrid } from "./ChoiceGrid";

const LABELS: Record<CategoryIcon, string> = {
  plate: "Plato",
  egg: "Huevo",
  flame: "Llama",
  banana: "Banano",
  fried: "Frito",
  citrus: "Cítrico",
  cup: "Vaso",
  water: "Agua",
};

const choices = (Object.keys(LABELS) as CategoryIcon[]).map((value) => {
  const Icon = categoryIcons[value];
  return {
    value,
    label: LABELS[value],
    icon: <Icon className="size-6" aria-hidden="true" />,
  };
});

/** Ícono de una categoría: se ve el dibujo de cada uno y se elige tocándolo. */
export function IconPicker({
  name = "icon",
  defaultValue,
}: {
  name?: string;
  defaultValue: string;
}) {
  return (
    <ChoiceGrid
      name={name}
      legend="Ícono"
      hint="El dibujo que sale junto al nombre de la categoría."
      variant="tiles"
      choices={choices}
      defaultValue={defaultValue as CategoryIcon}
    />
  );
}
