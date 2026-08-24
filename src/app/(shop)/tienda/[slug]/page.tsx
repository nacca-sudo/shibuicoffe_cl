import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb, Tag } from "antd";
import { prisma } from "@/lib/db";
import VariantSelector from "@/components/shop/VariantSelector";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const producto = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, isActive: true },
  });
  if (!producto || !producto.isActive) {
    return { title: "Producto no encontrado" };
  }
  return {
    title: producto.name,
    description: producto.description.slice(0, 160),
  };
}

export default async function ProductoPage({ params }: { params: Params }) {
  const { slug } = await params;
  const producto = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { where: { isActive: true }, orderBy: { price: "asc" } },
    },
  });

  if (!producto || !producto.isActive) {
    notFound();
  }

  const sinStock =
    producto.variants.length === 0 || producto.variants.every((v) => v.stock === 0);

  return (
    <>
      <Breadcrumb
        style={{ marginBottom: 24 }}
        items={[
          { title: <Link href="/">Inicio</Link> },
          { title: <Link href="/tienda">Tienda</Link> },
          { title: producto.name },
        ]}
      />
      <div className="ficha">
        <div className="imagen-redondeada">
          {/* TODO(fase-5): reemplazar placeholders por fotos reales (y galería con todas las imágenes) */}
          <Image
            src={producto.images[0] ?? "/img/producto-cafe.svg"}
            alt={producto.name}
            width={800}
            height={800}
            priority
            unoptimized
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
        <div>
          <Tag color="#6F4E37">{producto.category.name}</Tag>
          <h1 style={{ margin: "8px 0 16px", fontSize: "2.2rem" }}>{producto.name}</h1>
          <p style={{ fontSize: "1.05rem" }}>{producto.description}</p>
          {sinStock && (
            <p style={{ color: "#cf1322", fontWeight: 600 }}>Este producto está agotado por ahora — vuelve pronto.</p>
          )}
          <div style={{ marginTop: 24 }}>
            <VariantSelector
              variantes={producto.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price,
                stock: v.stock,
              }))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
