import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";
import CartDrawer from "@/components/shop/CartDrawer";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader conCarrito />
      <CartDrawer />
      <main className="contenedor" style={{ paddingTop: 40, paddingBottom: 64, minHeight: "60vh" }}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
