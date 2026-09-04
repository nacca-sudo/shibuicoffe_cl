"use client";

import { useState } from "react";
import { Button, InputNumber, Radio, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useCarrito } from "@/lib/cart/store";
import { formatCLP } from "@/lib/utils";

export type VarianteSeleccionable = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

/** Datos de display del producto para el ítem del carrito */
export type ProductoResumen = {
  nombre: string;
  slug: string;
  imagen: string;
};

export default function VariantSelector({
  variantes,
  producto,
}: {
  variantes: VarianteSeleccionable[];
  producto: ProductoResumen;
}) {
  const [varianteId, setVarianteId] = useState<string | undefined>(variantes[0]?.id);
  const [cantidad, setCantidad] = useState(1);
  const agregar = useCarrito((estado) => estado.agregar);
  const abrirDrawer = useCarrito((estado) => estado.abrirDrawer);

  const variante = variantes.find((v) => v.id === varianteId);

  if (!variante) {
    return <Typography.Text type="secondary">Sin stock</Typography.Text>;
  }

  const agregarAlCarrito = () => {
    if (variante.stock === 0) return;
    agregar(
      {
        variantId: variante.id,
        productSlug: producto.slug,
        productName: producto.nombre,
        variantName: variante.name,
        unitPrice: variante.price,
        image: producto.imagen,
        quantity: cantidad,
      },
      variante.stock,
    );
    abrirDrawer();
  };

  return (
    <div>
      <Typography.Text strong>Elige una opción</Typography.Text>
      <Radio.Group
        style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}
        value={varianteId}
        onChange={(e) => {
          setVarianteId(e.target.value);
          setCantidad(1);
        }}
        options={variantes.map((v) => ({
          value: v.id,
          label: `${v.name} — ${formatCLP(v.price)}`,
        }))}
      />

      <p className="ficha__precio" style={{ marginTop: 16 }}>
        {formatCLP(variante.price)}
      </p>
      <p className="ficha__stock">
        {variante.stock > 0 ? (
          <Typography.Text type="success">
            {variante.stock} {variante.stock === 1 ? "unidad disponible" : "unidades disponibles"}
          </Typography.Text>
        ) : (
          <Typography.Text type="danger">Sin stock</Typography.Text>
        )}
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16 }}>
        <InputNumber
          min={1}
          max={Math.max(variante.stock, 1)}
          value={cantidad}
          onChange={(valor) => setCantidad(valor ?? 1)}
          disabled={variante.stock === 0}
        />
        <Button
          type="primary"
          size="large"
          icon={<ShoppingCartOutlined />}
          disabled={variante.stock === 0}
          onClick={agregarAlCarrito}
        >
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
