// Lógica de negocio de pedidos (sin "use server"): se importa tanto desde las
// Server Actions (src/app/actions/pedidos.ts) como desde scripts de prueba.
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { COSTO_ENVIO_CLP } from "@/lib/utils";
import { checkoutSchema, itemCarritoSchema, type ItemCarritoInput } from "@/lib/validations/checkout";

export type ItemSinStock = { variantId: string; disponible: number };

export type ResultadoCrearPedido =
  | { ok: true; orderId: string }
  | { ok: false; errores: string[]; itemsSinStock?: ItemSinStock[] };

export type ResultadoConfirmarPago =
  | { ok: true; estado: "PAID" }
  | { ok: true; estado: "PAID_STOCK_ISSUE" }
  | { ok: true; estado: "YA_PROCESADO"; estadoActual: OrderStatus }
  | { ok: false; errores: string[] };

export type ResultadoSimple = { ok: true } | { ok: false; errores: string[] };

/** Línea del resumen de carrito con datos reales de DB (no los que guarda el cliente) */
export type LineaResumen = {
  variantId: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  stockDisponible: number;
  /** false si la variante no existe o ella/su producto están inactivos */
  disponibleParaComprar: boolean;
  subtotal: number;
};

export type ResumenCarrito = {
  lineas: LineaResumen[];
  subtotal: number;
  /** true si alguna línea no se puede comprar o no tiene stock suficiente */
  hayProblemas: boolean;
};

/** Error interno para gatillar rollback de la transacción de descuento de stock */
class StockInsuficienteError extends Error {
  constructor(public readonly variantId: string) {
    super(`Stock insuficiente para la variante ${variantId}`);
    this.name = "StockInsuficienteError";
  }
}

/** Fusiona cantidades de ítems duplicados (misma variante) y descarta entradas inválidas */
function consolidarItems(items: ItemCarritoInput[]): Map<string, number> {
  const cantidades = new Map<string, number>();
  for (const item of items) {
    const parsed = itemCarritoSchema.safeParse(item);
    if (!parsed.success) continue;
    cantidades.set(
      parsed.data.variantId,
      (cantidades.get(parsed.data.variantId) ?? 0) + parsed.data.quantity,
    );
  }
  return cantidades;
}

/**
 * Revalida el carrito del cliente contra la DB y devuelve el resumen con
 * precios y stock reales. Usado al entrar al checkout.
 */
export async function resumirCarrito(items: ItemCarritoInput[]): Promise<ResumenCarrito> {
  const cantidades = consolidarItems(items);
  if (cantidades.size === 0) {
    return { lineas: [], subtotal: 0, hayProblemas: false };
  }

  const variantes = await prisma.productVariant.findMany({
    where: { id: { in: [...cantidades.keys()] } },
    include: { product: { select: { name: true, isActive: true } } },
  });

  const lineas: LineaResumen[] = [...cantidades.entries()].map(([variantId, quantity]) => {
    const variante = variantes.find((v) => v.id === variantId);
    if (!variante) {
      return {
        variantId,
        productName: "Producto no disponible",
        variantName: "",
        unitPrice: 0,
        quantity,
        stockDisponible: 0,
        disponibleParaComprar: false,
        subtotal: 0,
      };
    }
    return {
      variantId,
      productName: variante.product.name,
      variantName: variante.name,
      unitPrice: variante.price,
      quantity,
      stockDisponible: variante.stock,
      disponibleParaComprar: variante.isActive && variante.product.isActive,
      subtotal: variante.price * quantity,
    };
  });

  const hayProblemas = lineas.some((l) => !l.disponibleParaComprar || l.stockDisponible < l.quantity);
  const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);
  return { lineas, subtotal, hayProblemas };
}

/**
 * Crea un pedido de invitado en estado PENDING_PAYMENT a partir del carrito.
 * Revalida cada variante contra la DB (existe, activa, producto activo, stock
 * suficiente) y congela precios y nombres en los OrderItem.
 */
export async function crearPedidoDesdeCarrito(input: unknown): Promise<ResultadoCrearPedido> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errores: parsed.error.issues.map((issue) => issue.message) };
  }
  const { nombre, email, telefono, metodoEntrega, direccion, items } = parsed.data;

  const cantidades = consolidarItems(items);
  const variantes = await prisma.productVariant.findMany({
    where: { id: { in: [...cantidades.keys()] } },
    include: { product: { select: { name: true, isActive: true } } },
  });

  const errores: string[] = [];
  const itemsSinStock: ItemSinStock[] = [];
  for (const [variantId, quantity] of cantidades) {
    const variante = variantes.find((v) => v.id === variantId);
    if (!variante) {
      errores.push("Un producto del carrito ya no está disponible.");
      itemsSinStock.push({ variantId, disponible: 0 });
      continue;
    }
    const nombreProducto = `${variante.product.name} (${variante.name})`;
    if (!variante.isActive || !variante.product.isActive) {
      errores.push(`"${nombreProducto}" ya no está disponible.`);
      itemsSinStock.push({ variantId, disponible: 0 });
      continue;
    }
    if (variante.stock < quantity) {
      errores.push(
        variante.stock === 0
          ? `"${nombreProducto}" se agotó.`
          : `Solo quedan ${variante.stock} unidades de "${nombreProducto}".`,
      );
      itemsSinStock.push({ variantId, disponible: variante.stock });
    }
  }
  if (errores.length > 0) {
    return { ok: false, errores, itemsSinStock };
  }

  const subtotal = variantes.reduce((acc, v) => acc + v.price * (cantidades.get(v.id) ?? 0), 0);
  const costoEnvio = metodoEntrega === "SHIPPING" ? COSTO_ENVIO_CLP : 0;

  const pedido = await prisma.order.create({
    data: {
      guestName: nombre,
      guestEmail: email,
      guestPhone: telefono,
      deliveryMethod: metodoEntrega,
      shippingCost: costoEnvio,
      total: subtotal + costoEnvio,
      status: "PENDING_PAYMENT",
      shippingAddress:
        metodoEntrega === "SHIPPING" && direccion
          ? {
              create: {
                street: direccion.calle,
                number: direccion.numero,
                comuna: direccion.comuna,
                ciudad: direccion.ciudad,
                region: direccion.region,
                notes: direccion.notas,
              },
            }
          : undefined,
      items: {
        create: variantes.map((v) => ({
          variantId: v.id,
          quantity: cantidades.get(v.id) ?? 0,
          unitPrice: v.price, // snapshot: el pedido no cambia aunque el precio se edite después
          productName: v.product.name,
          variantName: v.name,
        })),
      },
    },
  });

  return { ok: true, orderId: pedido.id };
}

/**
 * Confirma la recepción de un pago (en Fase 3 lo gatilla el webhook de la
 * pasarela). Idempotente: si el pedido no está en PENDING_PAYMENT retorna sin
 * hacer nada. Descuenta stock con decremento atómico condicional dentro de una
 * transacción; si alguna variante no alcanza, hace rollback y marca el pedido
 * PAID_STOCK_ISSUE (el pago ya se recibió → gestión manual, plan §7.3).
 */
export async function confirmarPagoRecibido(
  orderId: string,
  { provider, paymentId }: { provider: string; paymentId: string },
): Promise<ResultadoConfirmarPago> {
  const pedido = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!pedido) {
    return { ok: false, errores: ["Pedido no encontrado."] };
  }
  if (pedido.status !== "PENDING_PAYMENT") {
    return { ok: true, estado: "YA_PROCESADO", estadoActual: pedido.status };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of pedido.items) {
        const resultado = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (resultado.count === 0) {
          throw new StockInsuficienteError(item.variantId);
        }
      }
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          paymentId,
          paymentProvider: provider,
        },
      });
    });
    return { ok: true, estado: "PAID" };
  } catch (error) {
    if (error instanceof StockInsuficienteError) {
      // El pago ya se cobró pero no hay stock: queda para gestión manual
      // (reponer, sustituir o reembolsar desde la pasarela).
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID_STOCK_ISSUE",
          paidAt: new Date(),
          paymentId,
          paymentProvider: provider,
        },
      });
      return { ok: true, estado: "PAID_STOCK_ISSUE" };
    }
    throw error;
  }
}

/** Marca el pedido como PAYMENT_FAILED (pago rechazado; el stock nunca se tocó) */
export async function marcarPagoRechazado(orderId: string): Promise<ResultadoSimple> {
  const resultado = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "PAYMENT_FAILED" },
  });
  if (resultado.count === 0) {
    return { ok: false, errores: ["El pedido no existe o ya no está pendiente de pago."] };
  }
  return { ok: true };
}

/** Vuelve un pedido PAYMENT_FAILED a PENDING_PAYMENT para reintentar el pago */
export async function reintentarPagoPendiente(orderId: string): Promise<ResultadoSimple> {
  const resultado = await prisma.order.updateMany({
    where: { id: orderId, status: "PAYMENT_FAILED" },
    data: { status: "PENDING_PAYMENT" },
  });
  if (resultado.count === 0) {
    return { ok: false, errores: ["El pedido no existe o no está en estado de pago rechazado."] };
  }
  return { ok: true };
}
