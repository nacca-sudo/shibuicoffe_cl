"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Empty, InputNumber, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { seleccionarSubtotal, useCarrito, useCarritoHidratado } from "@/lib/cart/store";
import { formatCLP } from "@/lib/utils";

/** Revisión completa del carrito (precios referenciales; el servidor revalida en checkout) */
export default function CarritoClient() {
  const hidratado = useCarritoHidratado();
  const items = useCarrito((estado) => estado.items);
  const actualizarCantidad = useCarrito((estado) => estado.actualizarCantidad);
  const quitar = useCarrito((estado) => estado.quitar);
  const subtotal = useCarrito(seleccionarSubtotal);

  // El carrito vive en localStorage: hasta hidratar no sabemos si hay ítems
  if (!hidratado) {
    return (
      <div style={{ textAlign: "center", padding: "64px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty description="Tu carrito está vacío" style={{ padding: "48px 0" }}>
        <Link href="/tienda">
          <Button type="primary" size="large">
            Ir a la tienda
          </Button>
        </Link>
      </Empty>
    );
  }

  return (
    <div className="carrito-grid">
      <div>
        {items.map((item) => (
          <div key={item.variantId} className="carrito-item">
            <div className="carrito-item__imagen">
              <Image
                src={item.image}
                alt={item.productName}
                width={96}
                height={96}
                unoptimized
                style={{ objectFit: "cover", borderRadius: 8 }}
              />
            </div>
            <div className="carrito-item__info">
              <Link href={`/tienda/${item.productSlug}`} className="carrito-item__nombre">
                {item.productName}
              </Link>
              <span className="carrito-item__variante">{item.variantName}</span>
              <span className="carrito-item__precio">{formatCLP(item.unitPrice)} c/u</span>
              <div className="carrito-item__acciones">
                <InputNumber
                  min={1}
                  value={item.quantity}
                  onChange={(valor) => actualizarCantidad(item.variantId, valor ?? 1)}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Quitar ${item.productName} del carrito`}
                  onClick={() => quitar(item.variantId)}
                >
                  Quitar
                </Button>
              </div>
            </div>
            <div className="carrito-item__subtotal">{formatCLP(item.unitPrice * item.quantity)}</div>
          </div>
        ))}
      </div>

      <aside className="carrito-resumen">
        <h2 style={{ marginTop: 0, fontSize: "1.4rem" }}>Resumen</h2>
        <div className="carrito-resumen__fila">
          <span>Subtotal</span>
          <span>{formatCLP(subtotal)}</span>
        </div>
        <div className="carrito-resumen__fila">
          <span>Envío</span>
          <span>Se calcula en el checkout</span>
        </div>
        <div className="carrito-resumen__fila carrito-resumen__total">
          <span>Total</span>
          <span>{formatCLP(subtotal)}</span>
        </div>
        <Link href="/checkout">
          <Button type="primary" size="large" block>
            Ir a pagar
          </Button>
        </Link>
        <Link href="/tienda">
          <Button size="large" block style={{ marginTop: 8 }}>
            Seguir comprando
          </Button>
        </Link>
      </aside>
    </div>
  );
}
