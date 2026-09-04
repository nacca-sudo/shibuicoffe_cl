import Hero from "@/components/landing/Hero";
import Historia from "@/components/landing/Historia";
import MenuPdf from "@/components/landing/MenuPdf";
import Eventos from "@/components/landing/Eventos";
import Galeria from "@/components/landing/Galeria";
import Ubicacion from "@/components/landing/Ubicacion";
import Contacto from "@/components/landing/Contacto";
import { SITE_URL } from "@/lib/utils";

// Datos placeholder — actualizar con los datos reales del negocio
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Shibui Coffee",
  description:
    "Cafetería de especialidad en Santiago de Chile. Café de origen, métodos filtrados y pastelería.",
  url: SITE_URL,
  telephone: "+56 9 1234 5678",
  email: "hola@shibuicafe.cl",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Alameda Libertador Bernardo O'Higgins 333",
    addressLocality: "Santiago",
    addressRegion: "Región Metropolitana",
    addressCountry: "CL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:30",
      closes: "19:30",
    }

  ],
  servesCuisine: "Café de especialidad",
  priceRange: "$5000-$10000",
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <Historia />
      <MenuPdf />
      <Eventos />
      <Galeria />
      <Ubicacion />
      <Contacto />
    </>
  );
}
