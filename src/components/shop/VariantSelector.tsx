"use client";

import { useState } from "react";
import { Button, InputNumber, Radio, Tooltip, Typography } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { formatCLP } from "@/lib/utils";

export type VarianteSeleccionable = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function VariantSelector({
  variantes,
}: {
  variantes: VarianteSeleccionable[];
}) {
  const [varianteId, setVarianteId] = useState<string | undefined>(variantes[0]?.id);
  const [cantidad, setCantidad] = useState(1);

  const variante = variantes.find((v) => v.id === varianteId);

  if (!variante) {
    return <Typography.Text type="secondary">Sin stock</Typography.Text>;
  }

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
        {/* Fase 2: habilitar cuando exista el carrito */}
        <Tooltip title="Disponible próximamente">
          <span>
            <Button type="primary" size="large" icon={<ShoppingCartOutlined />} disabled>
              Agregar al carrito
            </Button>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
