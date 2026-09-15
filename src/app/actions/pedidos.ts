"use server";

import { revalidatePath } from "next/cache";
import {
  confirmarPagoRecibido,
  crearPedidoDesdeCarrito,
  marcarPagoRechazado,
  reintentarPagoPendiente,
  resumirCarrito,
  type ResumenCarrito,
  type ResultadoConfirmarPago,
  type ResultadoCrearPedido,
  type ResultadoSimple,
} from "@/lib/pedidos";
import type { ItemCarritoInput } from "@/lib/validations/checkout";

/** Resumen del carrito con precios y stock reales de DB (para mostrar en el checkout) */
export async function obtenerResumenCarrito(items: ItemCarritoInput[]): Promise<ResumenCarrito> {
  return resumirCarrito(items);
}

/** Crea el pedido en PENDING_PAYMENT revalidando todo contra la DB */
export async function crearPedido(input: unknown): Promise<ResultadoCrearPedido> {
  return crearPedidoDesdeCarrito(input);
}

// ── Simulación de pago (solo desarrollo) ──────────────────
// En Fase 3 esto lo ejecuta el webhook de la pasarela real.

function asegurarEntornoDev() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("La simulación de pagos solo está disponible en desarrollo.");
  }
}

export async function simularPagoAprobado(orderId: string): Promise<ResultadoConfirmarPago> {
  asegurarEntornoDev();
  const resultado = await confirmarPagoRecibido(orderId, {
    provider: "simulador-dev",
    paymentId: `SIM-${Date.now()}`,
  });
  revalidatePath(`/pedido/${orderId}`);
  return resultado;
}

export async function simularPagoRechazado(orderId: string): Promise<ResultadoSimple> {
  asegurarEntornoDev();
  const resultado = await marcarPagoRechazado(orderId);
  revalidatePath(`/pedido/${orderId}`);
  return resultado;
}

export async function reintentarPago(orderId: string): Promise<ResultadoSimple> {
  asegurarEntornoDev();
  const resultado = await reintentarPagoPendiente(orderId);
  revalidatePath(`/pedido/${orderId}`);
  return resultado;
}
