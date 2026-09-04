import { Button } from "antd";

/**
 * Sección "Menú" de la landing.
 * Decisión del cliente: el menú NO se muestra renderizado; se descarga como PDF.
 * TODO: reemplazar public/menu-shibui.pdf por el menú real
 * (placeholder generado con scripts/generate-menu-pdf.mjs).
 */
export default function MenuPdf() {
  return (
    <section id="menu" className="seccion">
      <div className="contenedor menu-pdf">
        <h2 className="seccion__titulo">Nuestro menú</h2>
        <p className="seccion__subtitulo">
          Café de especialidad, métodos filtrados y pastelería del día.
        </p>
        <p className="menu-pdf__texto">
          Preparamos cada taza con granos de origen tostados por nosotros.
          Descarga el menú completo y conoce lo que servimos todos los días en el local.
        </p>
        <Button
          type="primary"
          size="large"
          href="/menu-shibui.pdf"
          download="shibui-coffee-menu.pdf"
        >
          ↓ Descargar menú (PDF)
        </Button>
        <p className="menu-pdf__nota">Actualizado: septiembre 2026</p>
      </div>
    </section>
  );
}
