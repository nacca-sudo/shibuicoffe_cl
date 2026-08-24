"use client";

import { useRouter } from "next/navigation";
import { Button, Col, Row, Select, Slider, Switch, Typography } from "antd";
import { formatCLP } from "@/lib/utils";

type Categoria = { slug: string; nombre: string };

export type FiltrosActuales = {
  categoria?: string;
  min?: number;
  max?: number;
  disponible: boolean;
  orden?: string;
};

const ORDENES = [
  { value: "novedades", label: "Novedades" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
];

const PRECIO_TOPE = 20000; // CLP — límite visual del slider

export default function CatalogFilters({
  categorias,
  filtros,
}: {
  categorias: Categoria[];
  filtros: FiltrosActuales;
}) {
  const router = useRouter();

  const navegar = (cambios: Partial<Record<"categoria" | "min" | "max" | "disponible" | "orden", string | undefined>>) => {
    const params = new URLSearchParams();
    const estado: Record<string, string | undefined> = {
      categoria: filtros.categoria,
      min: filtros.min !== undefined ? String(filtros.min) : undefined,
      max: filtros.max !== undefined ? String(filtros.max) : undefined,
      disponible: filtros.disponible ? "true" : undefined,
      orden: filtros.orden,
      ...cambios,
    };
    for (const [clave, valor] of Object.entries(estado)) {
      if (valor) params.set(clave, valor);
    }
    // Al cambiar filtros siempre se vuelve a la página 1
    const qs = params.toString();
    router.push(qs ? `/tienda?${qs}` : "/tienda");
  };

  return (
    <div className="catalogo-filtros">
      <Row gutter={[24, 16]} align="middle">
        <Col xs={24} sm={12} md={6}>
          <Typography.Text strong>Categoría</Typography.Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Todas"
            allowClear
            value={filtros.categoria}
            onChange={(valor) => navegar({ categoria: valor ?? undefined })}
            options={categorias.map((c) => ({ value: c.slug, label: c.nombre }))}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Typography.Text strong>
            Precio: {formatCLP(filtros.min ?? 0)} – {formatCLP(filtros.max ?? PRECIO_TOPE)}
          </Typography.Text>
          <Slider
            range
            min={0}
            max={PRECIO_TOPE}
            step={500}
            value={[filtros.min ?? 0, filtros.max ?? PRECIO_TOPE]}
            onChangeComplete={([min, max]) =>
              navegar({
                min: min > 0 ? String(min) : undefined,
                max: max < PRECIO_TOPE ? String(max) : undefined,
              })
            }
            tooltip={{ formatter: (v) => formatCLP(v ?? 0) }}
          />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <Typography.Text strong>Disponibles</Typography.Text>
          <div style={{ marginTop: 8 }}>
            <Switch
              checked={filtros.disponible}
              onChange={(checked) =>
                navegar({ disponible: checked ? "true" : undefined })
              }
            />
          </div>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Typography.Text strong>Ordenar por</Typography.Text>
          <Select
            style={{ width: "100%", marginTop: 8 }}
            value={filtros.orden ?? "novedades"}
            onChange={(valor) =>
              navegar({ orden: valor === "novedades" ? undefined : valor })
            }
            options={ORDENES}
          />
        </Col>
      </Row>
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Button size="small" onClick={() => router.push("/tienda")}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
