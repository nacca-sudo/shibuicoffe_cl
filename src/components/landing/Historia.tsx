import Image from "next/image";

export default function Historia() {
  return (
    <section id="historia" className="seccion seccion--alterna">
      <div className="contenedor dos-columnas">
        <div className="imagen-redondeada">
          {/* TODO(fase-5): reemplazar placeholders por fotos reales */}
          <Image
            src="/img/historia.svg"
            alt="Interior del local de Shibui Café"
            width={800}
            height={600}
            unoptimized
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
        <div>
          <h2 className="seccion__titulo">Nuestra historia</h2>
          <p>
            Shibui (渋い) es una palabra japonesa que describe una belleza
            serena y discreta: la de las cosas bien hechas, sin estridencias.
            Esa idea guía todo lo que hacemos desde 2021.
          </p>
          <p>
            Trabajamos directamente con productores de Etiopía, Colombia,
            Brasil y Panamá; tostamos en pequeños lotes y preparamos cada taza
            con la precisión de un <em>kissaten</em>, los cafés tradicionales
            de Japón. Sin apuro, sin ruido: solo café, espacio y calma.
          </p>
          <p>
            Hoy queremos llevarte esa experiencia a casa: los mismos granos que
            servimos en barra, junto a objetos pensados para el ritual del café.
          </p>
        </div>
      </div>
    </section>
  );
}
