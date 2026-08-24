import Image from "next/image";
import Link from "next/link";
import { Card, Tag } from "antd";
import type { Category, Product, ProductVariant } from "@prisma/client";
import { formatCLP } from "@/lib/utils";

type ProductoConRelaciones = Product & {
  category: Category;
  variants: ProductVariant[];
};

// Nota: en Server Components solo se pueden usar exports directos de antd
// (los compuestos tipo Card.Meta / Badge.Ribbon llegan como undefined)
export default function ProductCard({ producto }: { producto: ProductoConRelaciones }) {
  const sinStock =
    producto.variants.length === 0 || producto.variants.every((v) => v.stock === 0);
  const precioDesde = producto.variants[0]?.price ?? producto.basePrice;

  return (
    <Link href={`/tienda/${producto.slug}`} style={{ textDecoration: "none" }}>
      <Card
        hoverable
        cover={
          <div className="producto-card-imagen">
            {sinStock && (
              <Tag color="red" className="producto-card-badge">
                Sin stock
              </Tag>
            )}
            {/* TODO(fase-5): reemplazar placeholders por fotos reales */}
            <Image
              src={producto.images[0] ?? "/img/producto-cafe.svg"}
              alt={producto.name}
              width={800}
              height={800}
              unoptimized
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        }
      >
        <Tag color="#6F4E37" style={{ marginBottom: 8 }}>
          {producto.category.name}
        </Tag>
        <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "#2B2622" }}>
          {producto.name}
        </div>
        <div style={{ fontWeight: 600, color: "#6F4E37", marginTop: 4 }}>
          desde {formatCLP(precioDesde)}
        </div>
      </Card>
    </Link>
  );
}
