"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, Drawer, Empty, InputNumber } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { seleccionarSubtotal, useCarrito, useCarritoHidratado } from "@/lib/cart/store";
import { formatCLP } from "@/lib/utils";

/** Drawer lateral con el contenido del carrito (precios referenciales del cliente) */
export default function CartDrawer() {
  const hidratado = useCarritoHidratado();
  const items = useCarrito((estado) => estado.items);
  const drawerAbierto = useCarrito((estado) => estado.drawerAbierto);
  const cerrarDrawer = useCarrito((estado) => estado.cerrarDrawer);
  const actualizarCantidad = useCarrito((estado) => estado.actualizarCantidad);
  const quitar = useCarrito((estado) => estado.quitar);
  const subtotal = useCarrito(seleccionarSubtotal);

  return (
    <Drawer
      title="Tu carrito"
      placement="right"
      width={420}
      open={drawerAbierto}
      onClose={cerrarDrawer}
    >
      {!hidratado || items.length === 0 ? (
        <Empty description="Tu carrito está vacío">
          <Link href="/tienda" onClick={cerrarDrawer}>
            <Button type="primary">Ir a la tienda</Button>
          </Link>
        </Empty>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ flex: 1 }}>
            {items.map((item) => (
              <div key={item.variantId} className="carrito-item">
                <div className="carrito-item__imagen">
                  <Image
                    src={item.image}
                    alt={item.productName}
                    width={64}
                    height={64}
                    unoptimized
                    style={{ objectFit: "cover", borderRadius: 8 }}
                  />
                </div>
                <div className="carrito-item__info">
                  <Link
                    href={`/tienda/${item.productSlug}`}
                    className="carrito-item__nombre"
                    onClick={cerrarDrawer}
                  >
                    {item.productName}
                  </Link>
                  <span className="carrito-item__variante">{item.variantName}</span>
                  <span className="carrito-item__precio">{formatCLP(item.unitPrice)} c/u</span>
                  <div className="carrito-item__acciones">
                    <InputNumber
                      size="small"
                      min={1}
                      value={item.quantity}
                      onChange={(valor) => actualizarCantidad(item.variantId, valor ?? 1)}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      aria-label={`Quitar ${item.productName} del carrito`}
                      icon={<DeleteOutlined />}
                      onClick={() => quitar(item.variantId)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="carrito-drawer__footer">
            <div className="carrito-drawer__subtotal">
              <span>Subtotal</span>
              <strong>{formatCLP(subtotal)}</strong>
            </div>
            <Link href="/carrito" onClick={cerrarDrawer}>
              <Button block size="large">
                Ver carrito
              </Button>
            </Link>
            <Link href="/checkout" onClick={cerrarDrawer}>
              <Button type="primary" block size="large">
                Finalizar compra
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
}
