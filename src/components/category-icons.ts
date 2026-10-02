import {
  Banana,
  Citrus,
  Croissant,
  CupSoda,
  EggFried,
  Flame,
  GlassWater,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIcon } from "@/lib/types";

export const categoryIcons: Record<CategoryIcon, LucideIcon> = {
  egg: EggFried,
  plate: UtensilsCrossed,
  flame: Flame,
  banana: Banana,
  fried: Croissant,
  citrus: Citrus,
  cup: CupSoda,
  water: GlassWater,
};
