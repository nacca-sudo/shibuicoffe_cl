import {
  eventos,
  formatFechaEvento,
  diaDeEvento,
  mesDeEvento,
} from "@/lib/data/eventos";
import EventosCalendar from "./EventosCalendar";

/**
 * Sección "Próximos eventos" de la landing: calendario interactivo + agenda.
 * La agenda se renderiza en servidor (contenido indexable); el calendario es
 * un client component (EventosCalendar).
 */
export default function Eventos() {
  const proximos = [...eventos].sort(
    (a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora),
  );

  return (
    <section id="eventos" className="seccion seccion--alterna">
      <div className="contenedor">
        <h2 className="seccion__titulo">Próximos eventos</h2>
        <p className="seccion__subtitulo">
          Catas, talleres y actividades en la cafetería. Los días marcados con
          un punto tienen eventos: tócalos para ver el detalle.
        </p>
        <div className="eventos-grid">
          <div className="eventos-calendario">
            <EventosCalendar />
          </div>
          <div className="eventos-agenda">
            <h3>Agenda</h3>
            {proximos.map((ev) => (
              <div key={`${ev.fecha}-${ev.titulo}`} className="evento-item">
                <div className="evento-item__fecha">
                  <span className="evento-item__dia">{diaDeEvento(ev.fecha)}</span>
                  <span className="evento-item__mes">{mesDeEvento(ev.fecha)}</span>
                </div>
                <div>
                  <span className="evento-item__titulo">{ev.titulo}</span>
                  <p className="evento-item__detalle">
                    {formatFechaEvento(ev.fecha)} · {ev.hora} hrs
                  </p>
                  <p className="evento-item__descripcion">{ev.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
