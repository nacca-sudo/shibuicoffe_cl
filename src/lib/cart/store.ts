"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Carrito del cliente (Zustand + localStorage).
 * Es solo una "intención": precios y stock reales se revalidan en el servidor
 * al crear el pedido (ver src/lib/pedidos.ts).
 */
export type ItemCarrito = {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  image: string;
  quantity: number;
};

type EstadoCarrito = {
  items: ItemCarrito[];
  drawerAbierto: boolean;
  /** Agrega un ítem; si la variante ya está en el carrito fusiona cantidades, topeadas al stock */
  agregar: (item: ItemCarrito, stockDisponible: number) => void;
  actualizarCantidad: (variantId: string, cantidad: number) => void;
  quitar: (variantId: string) => void;
  limpiar: () => void;
  abrirDrawer: () => void;
  cerrarDrawer: () => void;
};

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      drawerAbierto: false,

      agregar: (item, stockDisponible) => {
        if (stockDisponible <= 0) return;
        set((estado) => {
          const existente = estado.items.find((i) => i.variantId === item.variantId);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, stockDisponible) }
                  : i,
              ),
            };
          }
          return {
            items: [...estado.items, { ...item, quantity: Math.min(item.quantity, stockDisponible) }],
          };
        });
      },

      actualizarCantidad: (variantId, cantidad) => {
        if (cantidad <= 0) {
          set((estado) => ({ items: estado.items.filter((i) => i.variantId !== variantId) }));
          return;
        }
        set((estado) => ({
          items: estado.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: cantidad } : i,
          ),
        }));
      },

      quitar: (variantId) =>
        set((estado) => ({ items: estado.items.filter((i) => i.variantId !== variantId) })),

      limpiar: () => set({ items: [] }),
      abrirDrawer: () => set({ drawerAbierto: true }),
      cerrarDrawer: () => set({ drawerAbierto: false }),
    }),
    {
      name: "shibui-cart",
      // Solo persistir los ítems: el drawer siempre parte cerrado
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
);

/** Total de unidades en el carrito (para el badge del header) */
export const seleccionarTotalUnidades = (estado: EstadoCarrito) =>
  estado.items.reduce((acc, i) => acc + i.quantity, 0);

/** Subtotal según los precios guardados en el cliente (referencial; el servidor revalida) */
export const seleccionarSubtotal = (estado: EstadoCarrito) =>
  estado.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

/**
 * true cuando el carrito ya se hidrató desde localStorage.
 * Evita mismatch de hidratación: en SSR y en el primer render del cliente
 * devuelve false (vía getServerSnapshot) y React re-renderiza al hidratar.
 */
export function useCarritoHidratado(): boolean {
  return useSyncExternalStore(
    (notificar) => {
      if (useCarrito.persist.hasHydrated()) notificar();
      return useCarrito.persist.onFinishHydration(notificar);
    },
    () => useCarrito.persist.hasHydrated(),
    () => false,
  );
}
