"use client";

import Image from "next/image";
import { Carousel } from "antd";

export type FotoGaleria = {
  src: string;
  alt: string;
};

/**
 * Carrusel de la galería (client component: antd Carousel es interactivo).
 * Navegación con flechas, puntos y deslizamiento táctil en móvil.
 */
export default function GaleriaCarousel({ fotos }: { fotos: FotoGaleria[] }) {
  return (
    <Carousel arrows dots className="galeria-carousel">
      {fotos.map((foto) => (
        <div key={foto.src}>
          <div className="imagen-redondeada galeria-carousel__slide">
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              unoptimized
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      ))}
    </Carousel>
  );
}
