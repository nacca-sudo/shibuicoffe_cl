"use client";

import { Badge, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { seleccionarTotalUnidades, useCarrito, useCarritoHidratado } from "@/lib/cart/store";

/** Ícono de carrito con badge de unidades; abre el CartDrawer */
export default function CartButton() {
  // El carrito se hidrata desde localStorage: no mostrar el count hasta
  // hidratar, para evitar mismatch con el HTML del servidor.
  const hidratado = useCarritoHidratado();
  const totalUnidades = useCarrito(seleccionarTotalUnidades);
  const abrirDrawer = useCarrito((estado) => estado.abrirDrawer);

  return (
    <Badge count={hidratado ? totalUnidades : 0} size="small">
      <Button
        type="text"
        aria-label="Abrir carrito"
        icon={<ShoppingCartOutlined style={{ fontSize: 22 }} />}
        onClick={abrirDrawer}
      />
    </Badge>
  );
}
