// Datos placeholder claramente editables
const DIRECCION = "Av. Alameda Libertador Bernardo O'Higgins 333, Santiago";
const HORARIOS = [
  { dias: "Lunes a domingo", horas: "11:30 AM – 19:30 PM" },

];

export default function Ubicacion() {
  return (
    <section id="ubicacion" className="seccion">
      <div className="contenedor">
        <h2 className="seccion__titulo">Ubicación y horarios</h2>
        <p className="seccion__subtitulo">Te esperamos!</p>
        <div className="dos-columnas">
          {/* TODO: reemplazar por la dirección real del local */}
          <iframe
            className="mapa-frame"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.350422546988!2d-70.6413623!3d-33.4401758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662c57e0681585b%3A0xced450b6d5b8fb9!2sShibui%20coffee!5e0!3m2!1ses!2scl!4v1787606453605!5m2!1ses!2scl"
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
