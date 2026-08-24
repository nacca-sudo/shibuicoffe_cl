import Image from "next/image";
import Link from "next/link";
import { Button } from "antd";

export default function Hero() {
  return (
    <section className="contenedor hero">
      <div>
        <h1>Shibui Café</h1>
        <p>
          Café de especialidad en el corazón de Santiago. Tostamos con calma,
          servimos con intención: la belleza de lo simple, taza a taza.
        </p>
        <div className="hero__ctas">
          <Link href="/#menu">
            <Button size="large">Ver menú</Button>
          </Link>
          <Link href="/tienda">
            <Button type="primary" size="large">
              Visitar tienda
            </Button>
          </Link>
        </div>
      </div>
      <div className="hero__imagen">
        {/* TODO(fase-5): reemplazar placeholders por fotos reales */}
        <Image
          src="/img/hero.svg"
          alt="Taza de café de especialidad en Shibui Café"
          width={1600}
          height={900}
          priority
          unoptimized
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>
    </section>
  );
}
