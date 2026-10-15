import { slug } from "@/lib/slug";
import type { MenuCategory, MenuItem } from "@/lib/types";

/**
 * Menú del restaurante con los PRECIOS DEL LOCAL (la carta de las mesas). Precios en pesos
 * colombianos (COP), sin puntos: 8000 = $8.000. En la página de domicilios cada producto cuesta
 * `deliverySurcharge` (src/data/site.ts) más, salvo las categorías con `noDeliverySurcharge: true`.
 *
 * - Ocultar un plato por un rato: `available: false` (se muestra como "Agotado" y no se puede pedir).
 * - Un plato sin `price` se muestra en la carta pero no se puede pedir (hasta que se le ponga precio).
 * - Opciones al pedir (acompañantes, adicionales...): `options` de la categoría. Una opción con
 *   `price` suma ese valor al pedido; sin `price` va incluida. Todo lo que se cobra aparte va en un
 *   grupo `counted: true` (con contador) para poder pedir varias unidades.
 *
 * Este archivo es el respaldo y el contenido inicial: una vez que el menú se guarda en Supabase,
 * manda el del panel (se puede volver a cargar este desde el panel, en "Menú").
 */

type RawCategory = Omit<MenuCategory, "items"> & {
  items: Omit<MenuItem, "id">[];
};

/** Papa francesa que se agrega a un plato: se cobra aparte y se puede pedir más de una. */
const papaFrancesa = { id: "papa-francesa", name: "Papa francesa", price: 3000 };

const raw: RawCategory[] = [
  {
    id: "huevos",
    name: "Huevos",
    icon: "egg",
    items: [
      { name: "Huevos revueltos", price: 7000 },
      { name: "Huevos pericos", price: 8000 },
      { name: "Huevos rancheros", price: 9000 },
    ],
    options: [
      {
        id: "acompanante",
        title: "Acompañante",
        required: true,
        options: [
          { id: "patacones", name: "Patacones" },
          { id: "bollo", name: "Bollo" },
          { id: "yuca", name: "Yuca" },
          { id: "tajadas-verdes", name: "Tajadas verdes" },
        ],
      },
      {
        id: "adicionales",
        title: "Adicionales",
        counted: true,
        options: [
          { id: "cayeye", name: "Cayeye", price: 3000 },
          { id: "papas-fritas", name: "Papas fritas", price: 3000 },
        ],
      },
    ],
  },
  {
    id: "cayeye",
    name: "Cayeye",
    icon: "banana",
    // Precio igual en el local y a domicilio.
    noDeliverySurcharge: true,
    items: [{ name: "Cayeye con queso", price: 8000 }],
    options: [
      {
        id: "adicionales",
        title: "Adicionales",
        counted: true,
        options: [
          { id: "queso", name: "Queso", price: 3000 },
          { id: "salchicha", name: "Salchicha", price: 2000 },
          { id: "huevo", name: "Huevo", price: 1000 },
          { id: "chorizo", name: "Chorizo", price: 4000 },
        ],
      },
    ],
  },
  {
    id: "fritos",
    name: "Fritos",
    icon: "fried",
    noDeliverySurcharge: true,
    items: [
      { name: "Empanada", description: "De carne, pollo o queso", price: 3000 },
      { name: "Carimañola", description: "De carne, pollo o queso", price: 3500 },
      { name: "Papa rellena", description: "De carne o pollo", price: 3000 },
      { name: "Arepa dulce", price: 3000 },
      { name: "Arepa dulce rellena de queso", price: 4500 },
      { name: "Arepa con huevo", description: "Con 2 huevos", price: 4000 },
      { name: "Arepa huevo mixta", price: 5000 },
      { name: "Arepa huevo trifásica", price: 6000 },
      { name: "Aro de yuca dulce", price: 3000 },
      { name: "Pastelito", description: "Ranchero, hawaiano, etc.", price: 3500 },
      { name: "Dedito pequeño", price: 700 },
      { name: "Dedito grande", price: 3000 },
      { name: "Patacón relleno", price: 4000 },
      { name: "Mini fritos x50", description: "50 unidades. Programación previa", price: 45000 },
      { name: "Mini fritos x100", description: "100 unidades. Programación previa", price: 80000 },
    ],
  },
  {
    id: "picadas",
    name: "Picadas",
    icon: "plate",
    items: [
      { name: "Orejita de cerdo", price: 11000 },
      { name: "Cuajo", price: 11000 },
      { name: "Chinchurria", price: 11000 },
      { name: "Chicharrón al barril", price: 13000 },
      { name: "Bofe frito", price: 12000 },
      { name: "Chorizo de cerdo", price: 7000 },
      { name: "Chorizo y butifarra", price: 8000 },
      { name: "Morcilla", price: 8000 },
    ],
    includes: { title: "Incluyen", items: ["Patacones", "Salsas"] },
    options: [
      { id: "adicionales", title: "Adicionales", counted: true, options: [papaFrancesa] },
    ],
  },
  {
    id: "ejecutivos",
    name: "Ejecutivos",
    icon: "plate",
    items: [
      { name: "Carne guisada", price: 16000 },
      { name: "Panza guisada", price: 16000 },
      { name: "Albóndigas", price: 16000 },
      { name: "Pollo guisado", price: 16000 },
      { name: "Sobrebarriga", price: 16000 },
      { name: "Hígado encebollado", price: 16000 },
      { name: "Bofe frito", price: 16000 },
      { name: "Pechuga asada", price: 16000 },
      { name: "Loncha asada", price: 16000 },
      { name: "Desmechada", price: 16000 },
      { name: "Pajarilla", price: 16000 },
      { name: "Carne asada", price: 16000 },
      { name: "Lomo asado", price: 16000 },
      { name: "Lomo bechamel", price: 17000 },
      { name: "Lomo bistec", price: 17000 },
      { name: "Posta cartagenera", price: 18000 },
      { name: "Lengua guisada", price: 18000 },
      { name: "Costilla BBQ", price: 19000 },
      { name: "Costilla guisada", price: 19000 },
      { name: "Punta gorda", price: 26000 },
    ],
    includes: {
      title: "Incluyen",
      note: "Con cada ejecutivo",
      items: ["Sopa", "Bebida", "Acompañamientos del día"],
    },
    options: [
      {
        id: "arroz",
        title: "Cambio de arroz",
        options: [
          { id: "blanco", name: "Arroz blanco" },
          { id: "coco", name: "Arroz de coco", price: 1000 },
          { id: "cerdo", name: "Arroz de cerdo", price: 3000 },
        ],
      },
    ],
  },
  {
    id: "asados",
    name: "Asados",
    icon: "flame",
    items: [
      { name: "Sobrebarriga", price: 14000 },
      { name: "Carne de res", price: 15000 },
      { name: "Lomo de cerdo", price: 14000 },
      { name: "Loncha de cerdo", price: 14000 },
      { name: "Pechuga", price: 14000 },
      { name: "Carne bistec", price: 16000 },
      { name: "Lomo de cerdo bistec", price: 14000 },
      { name: "Pechuga bistec", price: 14000 },
      { name: "Punta gorda", price: 23000 },
    ],
    options: [
      {
        id: "acompanante",
        title: "Acompañante",
        required: true,
        options: [
          { id: "patacones", name: "Patacones" },
          { id: "bollo", name: "Bollo" },
          { id: "ensalada", name: "Ensalada" },
        ],
      },
      {
        id: "adicionales",
        title: "Adicionales",
        counted: true,
        options: [{ id: "sopa-corriente", name: "Sopa corriente", price: 5000 }, papaFrancesa],
      },
    ],
  },
  {
    id: "especiales",
    name: "Especiales (domingo)",
    navLabel: "Especiales",
    icon: "plate",
    note: "Solo los domingos.",
    // PENDIENTE: la carta de referencia no trae precios de estos platos. Sin precio se muestran
    // en la carta pero no se pueden pedir; se les pone el precio desde el panel.
    items: [
      { name: "Salmón asado" },
      { name: "Salmón al ajillo" },
      { name: "Posta lebranche frito" },
      { name: "Mojarra frita" },
    ],
    includes: { title: "Incluyen", items: ["Sopa", "Bebida", "Acompañamientos del día"] },
  },
  {
    id: "arroz-de-cerdo",
    name: "Arroz de cerdo",
    icon: "plate",
    items: [{ name: "Arroz de cerdo", price: 9000 }],
    options: [
      {
        id: "proteina",
        title: "Con",
        required: true,
        options: [
          { id: "cerdo", name: "Cerdo" },
          { id: "pollo", name: "Pollo" },
        ],
      },
    ],
  },
  {
    id: "sancochos",
    name: "Sancochos",
    icon: "plate",
    items: [
      { name: "Sancocho de costilla", price: 13000 },
      { name: "Sancocho de mondongo", price: 13000 },
      { name: "Sancocho de guandú", description: "Solo los sábados", price: 13000 },
      { name: "Sancocho de pescado", description: "Solo los domingos", price: 17000 },
    ],
    includes: { title: "Incluyen", items: ["Arroz", "Bebida"] },
  },
  {
    id: "adicionales",
    name: "Adicionales",
    icon: "fried",
    noDeliverySurcharge: true,
    items: [
      { name: "Adición de queso", price: 3000 },
      { name: "Adición de salchicha", price: 2000 },
      { name: "Adición de huevo", description: "Por unidad", price: 1000 },
      { name: "Adición de proteína", description: "Desde", price: 9000 },
      { name: "Porción de arroz blanco", price: 2000 },
      { name: "Porción de arroz de coco", price: 3000 },
      { name: "Adición de bistec o BBQ", price: 2000 },
      { name: "Porción de patacones o tajaditas", price: 4000 },
      { name: "Porción de papas fritas", price: 5000 },
      { name: "Adición de chorizo", price: 4000 },
    ],
  },
  {
    id: "jugos-sellados",
    name: "Jugos sellados",
    navLabel: "Jugos",
    icon: "citrus",
    noDeliverySurcharge: true,
    items: [
      { name: "Chicha", price: 3000 },
      { name: "Mora", price: 3000 },
      { name: "Mango", price: 3000 },
      { name: "Lulo", price: 3000 },
      { name: "Corozo", price: 3000 },
      { name: "Maracuyá", price: 3000 },
      { name: "Tomate de árbol", price: 3000 },
    ],
  },
  {
    id: "jugos-preparados",
    name: "Jugos preparados",
    navLabel: "Batidos",
    icon: "cup",
    note: "Prepáralos en agua o en leche.",
    price: 6000,
    layout: "chips",
    items: [
      { name: "Chocolisto" },
      { name: "Milo" },
      { name: "Fresa" },
      { name: "Guanábana" },
      { name: "Níspero" },
      { name: "Mora" },
      { name: "Zapote" },
      { name: "Tamarindo" },
      { name: "Naranja" },
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
    // PENDIENTE: no aparece en la carta de referencia. Se dejó como estaba; confirmar precios.
    id: "gaseosas-y-aguas",
    name: "Gaseosas y aguas",
    navLabel: "Gaseosas",
    icon: "water",
    noDeliverySurcharge: true,
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
