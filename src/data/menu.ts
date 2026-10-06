import { slug } from "@/lib/slug";
import type { MenuCategory, MenuItem, OptionGroup } from "@/lib/types";

/**
 * Menú del restaurante. Precios en pesos colombianos (COP), sin puntos: 8000 = $8.000.
 *
 * - Foto de un plato: `image: "/menu/mi-foto.jpg"` (archivo en public/menu).
 * - Ocultar un plato por un rato: `available: false` (se muestra como "Agotado" y no se puede pedir).
 * - Opciones al pedir (acompañantes, adicionales...): `options` de la categoría. Una opción con
 *   `price` suma ese valor al pedido; sin `price` va incluida. Todo lo que se cobra aparte va en un
 *   grupo `counted: true` (con contador) para poder pedir varias unidades.
 */

type RawCategory = Omit<MenuCategory, "items"> & {
  items: Omit<MenuItem, "id">[];
};

// Acompañante que ya viene con el plato: se elige uno.
const acompanante: OptionGroup = {
  id: "acompanante",
  title: "Acompañante",
  required: true,
  options: [
    { id: "yuca", name: "Yuca" },
    { id: "patacones", name: "Patacones" },
    { id: "tajaditas", name: "Tajaditas" },
  ],
};

// Lo que se paga aparte va con contador: el cliente pide las unidades que quiera de cada uno.
const adicionales: OptionGroup = {
  id: "adicionales",
  title: "Adicionales",
  counted: true,
  options: [
    { id: "papas-fritas", name: "Papas fritas", price: 3000 },
    { id: "cayeye", name: "Cayeye", price: 3000 },
  ],
};

const raw: RawCategory[] = [
  {
    id: "desayunos",
    name: "Desayunos",
    icon: "egg",
    items: [
      { name: "Huevo revuelto", price: 8000 },
      { name: "Huevo perico", price: 9000 },
      { name: "Huevo ranchero", price: 10000 },
    ],
    options: [acompanante, adicionales],
  },
  {
    id: "ejecutivos",
    name: "Ejecutivos",
    icon: "plate",
    items: [
      { name: "Loncha de cerdo asada", price: 17000 },
      { name: "Lomo de cerdo asado", price: 17000 },
      { name: "Sobrebarriga asada", price: 17000 },
      { name: "Carne guisada", price: 17000 },
      { name: "Desmechada", price: 17000 },
      { name: "Pajarilla", price: 17000 },
      { name: "Lengua", price: 19000 },
      { name: "Panza guisada", price: 17000 },
      { name: "Punta gorda", price: 27000 },
    ],
    includes: {
      title: "Acompañamientos",
      note: "Incluidos con cada ejecutivo",
      items: ["Arroz blanco", "Tajada", "Papa chorreada", "Sopa", "Bebida"],
    },
  },
  {
    id: "asados",
    name: "Asados",
    icon: "flame",
    items: [
      { name: "Lomo asado", price: 15000 },
      { name: "Loncha asada", price: 15000 },
      { name: "Carne asada", price: 16000 },
      { name: "Punta gorda", price: 24000 },
    ],
    options: [acompanante, adicionales],
  },
  {
    id: "cayeye",
    name: "Cayeye",
    icon: "banana",
    note: "Con queso rallado",
    items: [{ name: "Cayeye", price: 8000 }],
    options: [
      {
        id: "adicionales",
        title: "Adicionales",
        // Con contador: se puede pedir más de una unidad (ej. 2 de chorizo).
        // Para sumar más adicionales (queso, chicharrón...) agrega otra línea con su precio.
        counted: true,
        options: [{ id: "chorizo", name: "Chorizo", price: 4000 }],
      },
    ],
  },
  {
    id: "fritos",
    name: "Fritos",
    icon: "fried",
    items: [
      { name: "Empanada", description: "De carne, pollo o queso", price: 3000 },
      { name: "Arepa dulce", price: 3000 },
      { name: "Arepa dulce con queso", price: 4500 },
      { name: "Dedito pequeño", description: "Queso y bocadillo", price: 7000 },
      { name: "Arepa con huevo", price: 4000 },
    ],
  },
  {
    id: "jugos-empacados",
    name: "Jugos empacados",
    navLabel: "Jugos",
    icon: "citrus",
    items: [
      { name: "Maracuyá", price: 3000 },
      { name: "Lulo", price: 3000 },
      { name: "Tomate de árbol", price: 3000 },
      { name: "Mora", price: 3000 },
      { name: "Chicha de arroz", price: 3000 },
    ],
  },
  {
    id: "jugos-batidos",
    name: "Jugos batidos",
    navLabel: "Batidos",
    icon: "cup",
    note: "Prepáralos en agua o en leche.",
    price: 7000,
    layout: "chips",
    items: [
      { name: "Níspero" },
      { name: "Lulo" },
      { name: "Naranja" },
      { name: "Zapote" },
      { name: "Zanahoria" },
      { name: "Tomate de árbol" },
      { name: "Fresa" },
      { name: "Guanábana" },
      { name: "Milo" },
      { name: "Mora" },
      { name: "Limonada natural" },
      { name: "Limonada cerezada" },
    ],
    options: [
      {
        id: "base",
        title: "Prepáralo en",
        required: true,
        showInMenu: false,
        options: [
          { id: "agua", name: "Agua" },
          { id: "leche", name: "Leche" },
        ],
      },
    ],
  },
  {
    id: "gaseosas-y-aguas",
    name: "Gaseosas y aguas",
    navLabel: "Gaseosas",
    icon: "water",
    items: [
      { name: "Soda", price: 4000 },
      { name: "Ginger", price: 4000 },
      { name: "Quatro", price: 4000 },
      { name: "Sprite", price: 4000 },
      { name: "Kola Román", price: 4000 },
      { name: "Coca-Cola Original", price: 4500 },
      { name: "Coca-Cola Zero", price: 4500 },
      { name: "Agua manzana pequeña", price: 2500 },
      { name: "Agua grande", price: 3000 },
      { name: "Agua pequeña", price: 2000 },
      { name: "Agua con gas", price: 3000 },
    ],
  },
];

export const menu: MenuCategory[] = raw.map((category) => ({
  ...category,
  items: category.items.map((item) => ({
    ...item,
    id: `${category.id}-${slug(item.name)}`,
  })),
}));
