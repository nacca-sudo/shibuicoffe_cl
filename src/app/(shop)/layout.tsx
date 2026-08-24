import SiteHeader from "@/components/shared/SiteHeader";
import SiteFooter from "@/components/shared/SiteFooter";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="contenedor" style={{ paddingTop: 40, paddingBottom: 64, minHeight: "60vh" }}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
