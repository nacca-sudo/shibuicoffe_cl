import Link from "next/link";
import { Button } from "antd";
import CartButton from "@/components/shop/CartButton";

const NAV_LINKS = [
  { href: "/#historia", label: "Historia" },
  { href: "/#menu", label: "Menú" },
  { href: "/#eventos", label: "Eventos" },
  { href: "/#ubicacion", label: "Ubicación" },
  { href: "/#contacto", label: "Contacto" },
];

/**
 * Header compartido entre landing y tienda.
 * La landing no muestra carrito; la tienda pasa `conCarrito` (ver plan §4.2).
 */
export default function SiteHeader({ conCarrito = false }: { conCarrito?: boolean }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo">
          Shibui Coffee
        </Link>
        <nav className="site-nav" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/tienda">
            <Button type="primary">Tienda</Button>
          </Link>
          {conCarrito && <CartButton />}
        </nav>
      </div>
    </header>
  );
}
