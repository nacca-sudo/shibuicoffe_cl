// Datos placeholder claramente editables
const DIRECCION = "José Miguel de la Barra 456, Santiago Centro, Santiago";
const HORARIOS = [
  { dias: "Lunes a viernes", horas: "8:00 – 19:00" },
  { dias: "Sábado", horas: "9:00 – 18:00" },
  { dias: "Domingo", horas: "9:00 – 15:00" },
];

export default function Ubicacion() {
  return (
    <section id="ubicacion" className="seccion">
      <div className="contenedor">
        <h2 className="seccion__titulo">Ubicación y horarios</h2>
        <p className="seccion__subtitulo">Te esperamos con la tetera al hervor.</p>
        <div className="dos-columnas">
          {/* TODO: reemplazar por la dirección real del local */}
          <iframe
            className="mapa-frame"
            src="https://www.google.com/maps?q=Jos%C3%A9%20Miguel%20de%20la%20Barra%20456%2C%20Santiago&output=embed"
            loading="lazy"
            title="Mapa con la ubicación de Shibui Café"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="datos-ubicacion">
            <p>
              <strong>Dirección</strong>
              <br />
              {DIRECCION}
            </p>
            <p>
              <strong>Horario de atención</strong>
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {HORARIOS.map((h) => (
                <li key={h.dias} style={{ marginBottom: 8 }}>
                  {h.dias}: <strong>{h.horas}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
