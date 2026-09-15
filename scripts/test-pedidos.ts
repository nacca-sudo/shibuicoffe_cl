/**
 * Prueba de la lógica de pedidos (Fase 2) contra la DB local.
 * Ejecutar: npx tsx scripts/test-pedidos.ts
 *
 * Usa variantes reales del seed y deja la DB como estaba (borra los pedidos
 * de prueba y restaura el stock original).
 */
import { prisma } from "@/lib/db";
import { confirmarPagoRecibido, crearPedidoDesdeCarrito } from "@/lib/pedidos";
import { COSTO_ENVIO_CLP } from "@/lib/utils";

let fallos = 0;

function check(nombre: string, condicion: boolean, detalle?: unknown) {
  if (condicion) {
    console.log(`  ✓ ${nombre}`);
  } else {
    fallos++;
    console.error(`  ✗ ${nombre}${detalle !== undefined ? ` — ${JSON.stringify(detalle)}` : ""}`);
  }
}

const SKU_A = "CAFE-ETI-250-GRANO"; // stock 12, $9.900
const SKU_B = "CAFE-COL-250-GRANO"; // stock 15, $8.900
const SKU_C = "TAZA-HAS-220"; // stock 9, $10.900

const datosInvitado = {
  nombre: "Prueba Script",
  email: "prueba-script@shibui.test",
  telefono: "+56912345678",
};

const pedidosCreados: string[] = [];

async function main() {
  const [varA, varB, varC] = await Promise.all(
    [SKU_A, SKU_B, SKU_C].map((sku) =>
      prisma.productVariant.findUnique({ where: { sku }, include: { product: true } }),
    ),
  );
  if (!varA || !varB || !varC) {
    throw new Error("No se encontraron las variantes del seed. Corre `npx prisma db seed`.");
  }
  const stockOriginal = new Map([
    [varA.id, varA.stock],
    [varB.id, varB.stock],
    [varC.id, varC.stock],
  ]);
  console.log(
    `Stock inicial: ${SKU_A}=${varA.stock}, ${SKU_B}=${varB.stock}, ${SKU_C}=${varC.stock}`,
  );

  try {
    // ── a) Crear pedidos de invitado (retiro y envío) ──────────────────
    console.log("\na) Crear pedidos de invitado");
    const retiro = await crearPedidoDesdeCarrito({
      ...datosInvitado,
      metodoEntrega: "PICKUP",
      items: [
        { variantId: varA.id, quantity: 2 },
        { variantId: varB.id, quantity: 1 },
      ],
    });
    check("pedido con retiro creado", retiro.ok, retiro);
    if (!retiro.ok) throw new Error("No se pudo crear el pedido de retiro");
    pedidosCreados.push(retiro.orderId);

    const envio = await crearPedidoDesdeCarrito({
      ...datosInvitado,
      metodoEntrega: "SHIPPING",
      direccion: {
        calle: "Av. Italia",
        numero: "1234",
        comuna: "Providencia",
        ciudad: "Santiago",
        region: "Metropolitana de Santiago",
        notas: "Depto 302",
      },
      items: [{ variantId: varC.id, quantity: 1 }],
    });
    check("pedido con envío creado", envio.ok, envio);
    if (!envio.ok) throw new Error("No se pudo crear el pedido de envío");
    pedidosCreados.push(envio.orderId);

    const pedidoRetiro = await prisma.order.findUniqueOrThrow({
      where: { id: retiro.orderId },
      include: { items: true, shippingAddress: true },
    });
    check("retiro: estado PENDING_PAYMENT", pedidoRetiro.status === "PENDING_PAYMENT", pedidoRetiro.status);
    check("retiro: deliveryMethod PICKUP", pedidoRetiro.deliveryMethod === "PICKUP");
    check("retiro: shippingCost 0", pedidoRetiro.shippingCost === 0, pedidoRetiro.shippingCost);
    check(
      "retiro: total = 2×A + 1×B",
      pedidoRetiro.total === 2 * varA.price + varB.price,
      pedidoRetiro.total,
    );
    check("retiro: sin dirección", pedidoRetiro.shippingAddressId === null);
    check("retiro: datos de invitado", pedidoRetiro.guestEmail === datosInvitado.email);
    const itemA = pedidoRetiro.items.find((i) => i.variantId === varA.id);
    check(
      "retiro: snapshot de ítem (nombre, variante, precio)",
      itemA?.productName === varA.product.name &&
        itemA.variantName === varA.name &&
        itemA.unitPrice === varA.price &&
        itemA.quantity === 2,
      itemA,
    );

    const pedidoEnvio = await prisma.order.findUniqueOrThrow({
      where: { id: envio.orderId },
      include: { items: true, shippingAddress: true },
    });
    check("envío: shippingCost = tarifa plana", pedidoEnvio.shippingCost === COSTO_ENVIO_CLP);
    check(
      "envío: total = 1×C + envío",
      pedidoEnvio.total === varC.price + COSTO_ENVIO_CLP,
      pedidoEnvio.total,
    );
    check(
      "envío: dirección creada con datos",
      pedidoEnvio.shippingAddress?.street === "Av. Italia" &&
        pedidoEnvio.shippingAddress.number === "1234" &&
        pedidoEnvio.shippingAddress.comuna === "Providencia" &&
        pedidoEnvio.shippingAddress.region === "Metropolitana de Santiago" &&
        pedidoEnvio.shippingAddress.notes === "Depto 302",
      pedidoEnvio.shippingAddress,
    );

    // ── b) Confirmar pago: descuenta stock y marca PAID ────────────────
    console.log("\nb) Confirmar pago del pedido con retiro");
    const pago = await confirmarPagoRecibido(retiro.orderId, {
      provider: "test-script",
      paymentId: `TEST-${Date.now()}`,
    });
    check("resultado PAID", pago.ok && pago.estado === "PAID", pago);

    const pagado = await prisma.order.findUniqueOrThrow({ where: { id: retiro.orderId } });
    check("pedido queda PAID", pagado.status === "PAID", pagado.status);
    check("paidAt registrado", pagado.paidAt instanceof Date);
    check("paymentId/provider guardados", !!pagado.paymentId && pagado.paymentProvider === "test-script");

    const [despuesA, despuesB, despuesC] = await Promise.all([
      prisma.productVariant.findUniqueOrThrow({ where: { id: varA.id } }),
      prisma.productVariant.findUniqueOrThrow({ where: { id: varB.id } }),
      prisma.productVariant.findUniqueOrThrow({ where: { id: varC.id } }),
    ]);
    check("stock A bajó en 2", despuesA.stock === varA.stock - 2, despuesA.stock);
    check("stock B bajó en 1", despuesB.stock === varB.stock - 1, despuesB.stock);
    check("stock C intacto", despuesC.stock === varC.stock, despuesC.stock);

    // ── c) Idempotencia: confirmar de nuevo no hace nada ───────────────
    console.log("\nc) Idempotencia de confirmarPagoRecibido");
    const repetido = await confirmarPagoRecibido(retiro.orderId, {
      provider: "test-script",
      paymentId: `TEST-${Date.now()}-dup`,
    });
    check(
      "segunda confirmación reporta YA_PROCESADO",
      repetido.ok && repetido.estado === "YA_PROCESADO",
      repetido,
    );
    const stockTrasRepetir = await prisma.productVariant.findUniqueOrThrow({
      where: { id: varA.id },
    });
    check("stock A NO baja de nuevo", stockTrasRepetir.stock === despuesA.stock, stockTrasRepetir.stock);
    const siguePagado = await prisma.order.findUniqueOrThrow({ where: { id: retiro.orderId } });
    check("pedido sigue PAID", siguePagado.status === "PAID", siguePagado.status);

    // ── d) Oversell: pago recibido pero stock insuficiente ─────────────
    console.log("\nd) Oversell → rollback + PAID_STOCK_ISSUE");
    // crearPedidoDesdeCarrito valida stock, así que para forzar la ventana de
    // oversell (plan §7.3) se crea un pedido válido por todo el stock de C y
    // luego se baja el stock manualmente, simulando otra compra concurrente.
    const oversell = await crearPedidoDesdeCarrito({
      ...datosInvitado,
      metodoEntrega: "PICKUP",
      items: [{ variantId: varC.id, quantity: despuesC.stock }],
    });
    check("pedido oversell creado (válido al crear)", oversell.ok, oversell);
    if (!oversell.ok) throw new Error("No se pudo crear el pedido oversell");
    pedidosCreados.push(oversell.orderId);

    await prisma.productVariant.update({
      where: { id: varC.id },
      data: { stock: despuesC.stock - 1 },
    });
    const pagoOversell = await confirmarPagoRecibido(oversell.orderId, {
      provider: "test-script",
      paymentId: `TEST-${Date.now()}-oversell`,
    });
    check(
      "resultado PAID_STOCK_ISSUE",
      pagoOversell.ok && pagoOversell.estado === "PAID_STOCK_ISSUE",
      pagoOversell,
    );
    const pedidoOversell = await prisma.order.findUniqueOrThrow({ where: { id: oversell.orderId } });
    check("pedido queda PAID_STOCK_ISSUE", pedidoOversell.status === "PAID_STOCK_ISSUE", pedidoOversell.status);
    const stockTrasOversell = await prisma.productVariant.findUniqueOrThrow({
      where: { id: varC.id } });
    check(
      "rollback: stock C intacto tras el fallo",
      stockTrasOversell.stock === despuesC.stock - 1,
      stockTrasOversell.stock,
    );

    // ── e) Rechazos de validación ──────────────────────────────────────
    console.log("\ne) Rechazos");
    const inexistente = await crearPedidoDesdeCarrito({
      ...datosInvitado,
      metodoEntrega: "PICKUP",
      items: [{ variantId: "variante-inexistente", quantity: 1 }],
    });
    check(
      "variante inexistente → ok:false con itemsSinStock",
      !inexistente.ok &&
        !!inexistente.itemsSinStock?.some((i) => i.variantId === "variante-inexistente"),
      inexistente,
    );
    const cantidadCero = await crearPedidoDesdeCarrito({
      ...datosInvitado,
      metodoEntrega: "PICKUP",
      items: [{ variantId: varA.id, quantity: 0 }],
    });
    check("cantidad 0 → ok:false", !cantidadCero.ok, cantidadCero);
    const carritoVacio = await crearPedidoDesdeCarrito({
      ...datosInvitado,
      metodoEntrega: "PICKUP",
      items: [],
    });
    check("carrito vacío → ok:false", !carritoVacio.ok, carritoVacio);
  } finally {
    // ── f) Limpieza: borrar pedidos de prueba y restaurar stock ────────
    console.log("\nf) Limpieza");
    const direcciones = await prisma.order.findMany({
      where: { id: { in: pedidosCreados } },
      select: { shippingAddressId: true },
    });
    await prisma.order.deleteMany({ where: { id: { in: pedidosCreados } } });
    await prisma.address.deleteMany({
      where: {
        id: {
          in: direcciones
            .map((d) => d.shippingAddressId)
            .filter((id): id is string => id !== null),
        },
      },
    });
    for (const [variantId, stock] of stockOriginal) {
      await prisma.productVariant.update({ where: { id: variantId }, data: { stock } });
    }
    const pedidosRestantes = await prisma.order.count({ where: { id: { in: pedidosCreados } } });
    check("pedidos de prueba borrados", pedidosRestantes === 0, pedidosRestantes);
    const stockFinal = await prisma.productVariant.findUniqueOrThrow({ where: { id: varC.id } });
    check("stock restaurado al valor original", stockFinal.stock === stockOriginal.get(varC.id), stockFinal.stock);
  }

  console.log(fallos === 0 ? "\nTODOS LOS CHECKS PASARON" : `\n${fallos} CHECK(S) FALLARON`);
  if (fallos > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
