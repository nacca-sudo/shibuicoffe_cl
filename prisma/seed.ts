import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TODO(fase-5): reemplazar placeholders por fotos reales
const IMG = {
  cafe: ["/img/producto-cafe.svg"],
  polera: ["/img/producto-polera.svg"],
  taza: ["/img/producto-taza.svg"],
  accesorio: ["/img/producto-accesorio.svg"],
};

type Variante = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
};

type Producto = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  images: string[];
  variants: Variante[];
};

const grano = (g: string) => ({ gramaje: g, molienda: "Grano entero" });
const molido = (g: string) => ({ gramaje: g, molienda: "Molido para filtro" });

async function main() {
  // Idempotente: borra y recrea solo el catálogo (no toca pedidos ni usuarios)
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const categorias = await Promise.all(
    [
      { name: "Café", slug: "cafe", image: "/img/producto-cafe.svg" },
      { name: "Poleras", slug: "poleras", image: "/img/producto-polera.svg" },
      { name: "Tazas", slug: "tazas", image: "/img/producto-taza.svg" },
      { name: "Accesorios", slug: "accesorios", image: "/img/producto-accesorio.svg" },
    ].map((c) => prisma.category.create({ data: c })),
  );
  const cat = Object.fromEntries(categorias.map((c) => [c.slug, c.id]));

  const productos: Producto[] = [
    {
      name: "Café Etiopía Yirgacheffe",
      slug: "cafe-etiopia-yirgacheffe",
      description:
        "Lavado de la región de Yirgacheffe. Notas florales de jazmín, bergamota y durazno. Tueste medio-claro, ideal para métodos filtrados.",
      categoryId: cat["cafe"],
      images: IMG.cafe,
      variants: [
        { name: "250 g · Grano entero", sku: "CAFE-ETI-250-GRANO", price: 9900, stock: 12, attributes: grano("250 g") },
        { name: "250 g · Molido", sku: "CAFE-ETI-250-MOLIDO", price: 9900, stock: 0, attributes: molido("250 g") },
        { name: "500 g · Grano entero", sku: "CAFE-ETI-500-GRANO", price: 13900, stock: 8, attributes: grano("500 g") },
      ],
    },
    {
      name: "Café Colombia Huila",
      slug: "cafe-colombia-huila",
      description:
        "Lavado de pequeños productores de Huila. Taza dulce y redonda: caramelo, naranja y chocolate con leche. Nuestro todoterreno para espresso y filtro.",
      categoryId: cat["cafe"],
      images: IMG.cafe,
      variants: [
        { name: "250 g · Grano entero", sku: "CAFE-COL-250-GRANO", price: 8900, stock: 15, attributes: grano("250 g") },
        { name: "250 g · Molido", sku: "CAFE-COL-250-MOLIDO", price: 8900, stock: 10, attributes: molido("250 g") },
        { name: "500 g · Grano entero", sku: "CAFE-COL-500-GRANO", price: 12900, stock: 6, attributes: grano("500 g") },
      ],
    },
    {
      name: "Blend de la casa Shibui",
      slug: "blend-de-la-casa-shibui",
      description:
        "Nuestro blend insignia: 60 % Brasil natural y 40 % Colombia lavado. Cacao, avellanas y un dulzor persistente. Pensado para espresso con o sin leche.",
      categoryId: cat["cafe"],
      images: IMG.cafe,
      variants: [
        { name: "250 g · Grano entero", sku: "CAFE-BLE-250-GRANO", price: 10900, stock: 20, attributes: grano("250 g") },
        { name: "500 g · Grano entero", sku: "CAFE-BLE-500-GRANO", price: 14900, stock: 4, attributes: grano("500 g") },
      ],
    },
    {
      name: "Café Panamá Geisha",
      slug: "cafe-panama-geisha",
      description:
        "Micro-lote Geisha de Boquete. Taza compleja y elegante: jazmín, mandarina y miel. Producción muy limitada — vuelve pronto.",
      categoryId: cat["cafe"],
      images: IMG.cafe,
      variants: [
        { name: "250 g · Grano entero", sku: "CAFE-PAN-250-GRANO", price: 13900, stock: 0, attributes: grano("250 g") },
        { name: "250 g · Molido", sku: "CAFE-PAN-250-MOLIDO", price: 13900, stock: 0, attributes: molido("250 g") },
      ],
    },
    {
      name: "Polera Shibui Logo",
      slug: "polera-shibui-logo",
      description:
        "Algodón orgánico 220 g, color crudo, con el logo Shibui serigrafiado al pecho. Corte unisex, prenda prelavada.",
      categoryId: cat["poleras"],
      images: IMG.polera,
      variants: [
        { name: "Talla S", sku: "POL-LOGO-S", price: 15900, stock: 5, attributes: { talla: "S", color: "Crudo" } },
        { name: "Talla M", sku: "POL-LOGO-M", price: 15900, stock: 8, attributes: { talla: "M", color: "Crudo" } },
        { name: "Talla L", sku: "POL-LOGO-L", price: 15900, stock: 3, attributes: { talla: "L", color: "Crudo" } },
        { name: "Talla XL", sku: "POL-LOGO-XL", price: 15900, stock: 0, attributes: { talla: "XL", color: "Crudo" } },
      ],
    },
    {
      name: "Polera Kissaten",
      slug: "polera-kissaten",
      description:
        "Homenaje a los kissaten, los cafés tradicionales japoneses. Algodón peinado color carbón, estampado trasero. Corte unisex.",
      categoryId: cat["poleras"],
      images: IMG.polera,
      variants: [
        { name: "Talla S", sku: "POL-KIS-S", price: 17900, stock: 2, attributes: { talla: "S", color: "Carbón" } },
        { name: "Talla M", sku: "POL-KIS-M", price: 17900, stock: 6, attributes: { talla: "M", color: "Carbón" } },
        { name: "Talla L", sku: "POL-KIS-L", price: 17900, stock: 6, attributes: { talla: "L", color: "Carbón" } },
        { name: "Talla XL", sku: "POL-KIS-XL", price: 17900, stock: 1, attributes: { talla: "XL", color: "Carbón" } },
      ],
    },
    {
      name: "Taza de cerámica Hasami",
      slug: "taza-de-ceramica-hasami",
      description:
        "Cerámica de Hasami (Japón), esmalte mate color arena. 220 ml, capacidad perfecta para flat white. Apta para lavavajillas.",
      categoryId: cat["tazas"],
      images: IMG.taza,
      variants: [
        { name: "Única · 220 ml", sku: "TAZA-HAS-220", price: 10900, stock: 9, attributes: { capacidad: "220 ml", material: "Cerámica" } },
      ],
    },
    {
      name: "Taza de vidrio doble pared",
      slug: "taza-de-vidrio-doble-pared",
      description:
        "Vidrio borosilicato de doble pared: mantiene la temperatura sin quemar tus manos. 250 ml, ideal para apreciar el color de un buen filtrado.",
      categoryId: cat["tazas"],
      images: IMG.taza,
      variants: [
        { name: "Única · 250 ml", sku: "TAZA-VDR-250", price: 9900, stock: 14, attributes: { capacidad: "250 ml", material: "Vidrio" } },
      ],
    },
    {
      name: "Taza Shibui negra mate",
      slug: "taza-shibui-negra-mate",
      description:
        "Nuestra taza de la casa: gres negro mate con logo grabado. 300 ml. Actualmente agotada, volverá en el próximo horneado.",
      categoryId: cat["tazas"],
      images: IMG.taza,
      variants: [
        { name: "Única · 300 ml", sku: "TAZA-SHI-300", price: 11900, stock: 0, attributes: { capacidad: "300 ml", material: "Gres" } },
      ],
    },
    {
      name: "Prensa francesa 350 ml",
      slug: "prensa-francesa-350-ml",
      description:
        "Prensa francesa de acero inoxidable y vidrio borosilicato, 350 ml (2 tazas). Filtro de malla fina para una taza limpia y con cuerpo.",
      categoryId: cat["accesorios"],
      images: IMG.accesorio,
      variants: [
        { name: "Única · 350 ml", sku: "ACC-PRE-350", price: 16900, stock: 7, attributes: { capacidad: "350 ml", material: "Acero y vidrio" } },
      ],
    },
  ];

  for (const { variants, ...producto } of productos) {
    await prisma.product.create({
      data: {
        ...producto,
        basePrice: Math.min(...variants.map((v) => v.price)),
        variants: { create: variants },
      },
    });
  }

  const [totalProductos, totalVariantes] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);
  console.log(
    `Seed OK: ${categorias.length} categorías, ${totalProductos} productos, ${totalVariantes} variantes`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
