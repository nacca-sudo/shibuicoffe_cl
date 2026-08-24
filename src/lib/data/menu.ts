/**
 * Menú de la cafetería física (landing).
 * Contenido estático gestionado por el equipo técnico — cambia poco.
 * Si el cliente necesita editarlo solo, se migra a DB en una fase posterior.
 */

export type MenuCategoria =
  | "Cafés de especialidad"
  | "Métodos filtrados"
  | "Para acompañar";

export type MenuItem = {
  nombre: string;
  descripcion: string;
  precio: number; // CLP
  categoria: MenuCategoria;
};

export const MENU_CATEGORIAS: MenuCategoria[] = [
  "Cafés de especialidad",
  "Métodos filtrados",
  "Para acompañar",
];

export const menuCafeteria: MenuItem[] = [
  // Cafés de especialidad
  { nombre: "Espresso", descripcion: "Doble shot de nuestro blend de la casa.", precio: 2500, categoria: "Cafés de especialidad" },
  { nombre: "Cortado", descripcion: "Espresso con un toque de leche texturizada.", precio: 2800, categoria: "Cafés de especialidad" },
  { nombre: "Flat white", descripcion: "Doble ristretto y microespuma sedosa.", precio: 3500, categoria: "Cafés de especialidad" },
  { nombre: "Capuchino", descripcion: "El clásico: espresso, leche y espuma en tercios.", precio: 3500, categoria: "Cafés de especialidad" },
  { nombre: "Latte", descripcion: "Suave y cremoso, con latte art de la casa.", precio: 3800, categoria: "Cafés de especialidad" },
  { nombre: "Mocha", descripcion: "Espresso, chocolate 70 % y leche texturizada.", precio: 4000, categoria: "Cafés de especialidad" },
  // Métodos filtrados
  { nombre: "V60", descripcion: "Filtrado limpio y brillante; café de origen a elección.", precio: 4000, categoria: "Métodos filtrados" },
  { nombre: "Chemex", descripcion: "Taza dulce y cristalina, ideal para compartir.", precio: 4500, categoria: "Métodos filtrados" },
  { nombre: "Aeropress", descripcion: "Cuerpo medio y dulzor concentrado.", precio: 4000, categoria: "Métodos filtrados" },
  { nombre: "Cold brew", descripcion: "Infusión en frío por 18 horas. Servido con hielo.", precio: 4200, categoria: "Métodos filtrados" },
  // Para acompañar
  { nombre: "Croissant", descripcion: "Mantequilla francesa, horneado cada mañana.", precio: 2800, categoria: "Para acompañar" },
  { nombre: "Kuchen de nuez", descripcion: "Receta sureña, masa de mantequilla y nueces caramelizadas.", precio: 3500, categoria: "Para acompañar" },
  { nombre: "Cheesecake de maracuyá", descripcion: "Cremoso, con coulis de maracuyá fresco.", precio: 4200, categoria: "Para acompañar" },
  { nombre: "Sándwich ave palta", descripcion: "Pan de masa madre, pollo desmechado y palta.", precio: 4800, categoria: "Para acompañar" },
];
