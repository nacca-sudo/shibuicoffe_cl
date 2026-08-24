import Hero from "@/components/landing/Hero";
import Historia from "@/components/landing/Historia";
import MenuCafeteria from "@/components/landing/MenuCafeteria";
import Galeria from "@/components/landing/Galeria";
import Ubicacion from "@/components/landing/Ubicacion";
import Contacto from "@/components/landing/Contacto";
import { SITE_URL } from "@/lib/utils";

// Datos placeholder — actualizar con los datos reales del negocio
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Shibui Café",
  description:
    "Cafetería de especialidad en Santiago de Chile. Café de origen, métodos filtrados y pastelería.",
  url: SITE_URL,
  telephone: "+56 9 1234 5678",
  email: "hola@shibuicafe.cl",
  address: {
    "@type": "PostalAddress",
    streetAddress: "José Miguel de la Barra 456",
    addressLocality: "Santiago",
    addressRegion: "Región Metropolitana",
    addressCountry: "CL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Sunday",
      opens: "09:00",
      closes: "15:00",
    },
  ],
  servesCuisine: "Café de especialidad",
  priceRange: "$$",
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
      <MenuCafeteria />
      <Galeria />
      <Ubicacion />
      <Contacto />
    </>
  );
}
