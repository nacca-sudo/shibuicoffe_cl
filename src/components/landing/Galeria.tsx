import Image from "next/image";

// TODO(fase-5): reemplazar placeholders por fotos reales
const FOTOS = [
  { src: "/img/galeria-1.svg", alt: "La barra del café" },
  { src: "/img/galeria-2.svg", alt: "Preparación de métodos filtrados" },
  { src: "/img/galeria-3.svg", alt: "Interior del local" },
  { src: "/img/galeria-4.svg", alt: "Tostado de granos" },
];

export default function Galeria() {
  return (
    <section id="galeria" className="seccion">
      <div className="contenedor">
        <h2 className="seccion__titulo">El espacio</h2>
        <p className="seccion__subtitulo">
          Un rincón tranquilo en el centro de Santiago.
        </p>
        <div className="galeria-grid">
          {FOTOS.map((foto) => (
            <div key={foto.src} className="imagen-redondeada">
              <Image
                src={foto.src}
                alt={foto.alt}
                width={600}
                height={600}
                unoptimized
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
