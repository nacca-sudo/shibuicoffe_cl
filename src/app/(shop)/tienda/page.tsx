import type { Metadata } from "next";
import { Col, Empty, Row } from "antd";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/shop/ProductCard";
import CatalogFilters, { type FiltrosActuales } from "@/components/shop/CatalogFilters";
import CatalogPagination from "@/components/shop/CatalogPagination";

// Las páginas que consultan la DB se renderizan por request:
// así `next build` no exige una DB viva (importante para CI)
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Café en grano, tazas, poleras y accesorios de Shibui Café. Envíos a todo Chile y retiro en tienda.",
};

const PAGE_SIZE = 12;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function primerValor(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

function aEnteroPositivo(valor: string | string[] | undefined): number | undefined {
  const crudo = primerValor(valor);
  if (!crudo) return undefined;
  const n = Number(crudo);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

export default async function TiendaPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const categoria = primerValor(sp.categoria);
  const min = aEnteroPositivo(sp.min);
  const max = aEnteroPositivo(sp.max);
  const disponible = primerValor(sp.disponible) === "true";
  const orden = primerValor(sp.orden);
  const pagina = Math.max(aEnteroPositivo(sp.pagina) ?? 1, 1);

  // Filtros compuestos: categoría por slug + variantes activas que cumplen
  // precio en rango y/o stock disponible (en una sola condición `some`)
  const condicionVariante: Prisma.ProductVariantWhereInput = {
    isActive: true,
    ...(min !== undefined || max !== undefined
      ? { price: { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) } }
      : {}),
    ...(disponible ? { stock: { gt: 0 } } : {}),
  };

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(categoria ? { category: { slug: categoria } } : {}),
    ...(min !== undefined || max !== undefined || disponible
      ? { variants: { some: condicionVariante } }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    orden === "precio-asc"
      ? { basePrice: "asc" }
      : orden === "precio-desc"
        ? { basePrice: "desc" }
        : { createdAt: "desc" }; // novedades (default)

  const [total, productos, categorias] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (pagina - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        variants: { where: { isActive: true }, orderBy: { price: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const filtros: FiltrosActuales = { categoria, min, max, disponible, orden };
  const queryActual: Record<string, string> = {};
  if (categoria) queryActual.categoria = categoria;
  if (min !== undefined) queryActual.min = String(min);
  if (max !== undefined) queryActual.max = String(max);
  if (disponible) queryActual.disponible = "true";
  if (orden) queryActual.orden = orden;

  return (
    <>
      <h1 style={{ fontSize: "2.2rem", marginBottom: 8 }}>Tienda</h1>
      <p style={{ marginBottom: 32, color: "#4A3525" }}>Los mismos granos que servimos en barra, y objetos para tu ritual del café.</p>

      <CatalogFilters
        categorias={categorias.map((c) => ({ slug: c.slug, nombre: c.name }))}
        filtros={filtros}
      />

      {productos.length === 0 ? (
        <Empty
          description="No encontramos productos con esos filtros"
          style={{ padding: "48px 0" }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {productos.map((producto) => (
            <Col key={producto.id} xs={24} sm={12} md={8} lg={6}>
              <ProductCard producto={producto} />
            </Col>
          ))}
        </Row>
      )}

      <CatalogPagination
        total={total}
        pagina={pagina}
        pageSize={PAGE_SIZE}
        query={queryActual}
      />
    </>
  );
}
