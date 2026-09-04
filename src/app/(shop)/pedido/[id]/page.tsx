import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Tag } from "antd";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatCLP } from "@/lib/utils";
import SimuladorPago from "@/components/shop/SimuladorPago";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

const ESTADOS: Record<OrderStatus, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: "Pendiente de pago", color: "gold" },
  PAID: { label: "Pagado", color: "green" },
  PAID_STOCK_ISSUE: { label: "Pagado — problema de stock", color: "orange" },
  PREPARING: { label: "En preparación", color: "blue" },
  SHIPPED: { label: "Enviado", color: "geekblue" },
  READY_FOR_PICKUP: { label: "Listo para retiro", color: "cyan" },
  COMPLETED: { label: "Completado", color: "green" },
  PAYMENT_FAILED: { label: "Pago rechazado", color: "red" },
  CANCELLED: { label: "Cancelado", color: "default" },
  REFUNDED: { label: "Reembolsado", color: "purple" },
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Pedido #${id.slice(0, 8)}` };
}

export default async function PedidoPage({ params }: { params: Params }) {
  const { id } = await params;
  const pedido = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingAddress: true },
  });
  if (!pedido) {
    notFound();
  }

  const estado = ESTADOS[pedido.status];
  const subtotal = pedido.total - pedido.shippingCost;
  const esDev = process.env.NODE_ENV !== "production";

  return (
    <>
      <div className="pedido-cabecera">
        <h1 style={{ margin: 0 }}>Pedido #{pedido.id.slice(0, 8)}</h1>
        <Tag color={estado.color} style={{ fontSize: "0.95rem", padding: "4px 12px" }}>
          {estado.label}
        </Tag>
      </div>
      <p style={{ color: "var(--cafe)", marginTop: 0 }}>
        Realizado el{" "}
        {pedido.createdAt.toLocaleDateString("es-CL", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {pedido.paidAt &&
          ` · Pagado el ${pedido.paidAt.toLocaleDateString("es-CL", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}`}
      </p>

      {esDev && (pedido.status === "PENDING_PAYMENT" || pedido.status === "PAYMENT_FAILED") && (
        <SimuladorPago
          orderId={pedido.id}
          estado={pedido.status as "PENDING_PAYMENT" | "PAYMENT_FAILED"}
        />
      )}

      <div className="checkout-grid" style={{ marginTop: 24 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem" }}>Productos</h2>
          {pedido.items.map((item) => (
            <div key={item.id} className="carrito-item">
              <div className="carrito-item__info">
                <span className="carrito-item__nombre">{item.productName}</span>
                <span className="carrito-item__variante">{item.variantName}</span>
                <span className="carrito-item__precio">
                  {formatCLP(item.unitPrice)} × {item.quantity}
                </span>
              </div>
              <div className="carrito-item__subtotal">
                {formatCLP(item.unitPrice * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <aside>
          <div className="carrito-resumen">
            <h2 style={{ marginTop: 0, fontSize: "1.4rem" }}>Totales</h2>
            <div className="carrito-resumen__fila">
              <span>Subtotal</span>
              <span>{formatCLP(subtotal)}</span>
            </div>
            <div className="carrito-resumen__fila">
              <span>Envío</span>
              <span>{pedido.shippingCost === 0 ? "Gratis" : formatCLP(pedido.shippingCost)}</span>
            </div>
            <div className="carrito-resumen__fila carrito-resumen__total">
              <span>Total</span>
              <span>{formatCLP(pedido.total)}</span>
            </div>
          </div>

          <div className="carrito-resumen" style={{ marginTop: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: "1.4rem" }}>Datos de contacto</h2>
            <p style={{ margin: "0 0 4px" }}>{pedido.guestName}</p>
            <p style={{ margin: "0 0 4px" }}>{pedido.guestEmail}</p>
            <p style={{ margin: 0 }}>{pedido.guestPhone}</p>
          </div>

          <div className="carrito-resumen" style={{ marginTop: 24 }}>
            <h2 style={{ marginTop: 0, fontSize: "1.4rem" }}>Entrega</h2>
            {pedido.deliveryMethod === "PICKUP" ? (
              <p style={{ margin: 0 }}>Retiro en tienda</p>
            ) : pedido.shippingAddress ? (
              <>
                <p style={{ margin: "0 0 4px" }}>
                  {pedido.shippingAddress.street} {pedido.shippingAddress.number}
                </p>
                <p style={{ margin: "0 0 4px" }}>
                  {pedido.shippingAddress.comuna}, {pedido.shippingAddress.ciudad}
                </p>
                <p style={{ margin: 0 }}>Región {pedido.shippingAddress.region}</p>
                {pedido.shippingAddress.notes && (
                  <p style={{ margin: "8px 0 0", color: "var(--cafe)" }}>
                    Notas: {pedido.shippingAddress.notes}
                  </p>
                )}
              </>
            ) : (
              <p style={{ margin: 0 }}>Envío a domicilio</p>
            )}
          </div>
        </aside>
      </div>

      <div style={{ marginTop: 40 }}>
        <Link href="/tienda">
          <Button size="large">Volver a la tienda</Button>
        </Link>
      </div>
    </>
  );
}
