"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Modal } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { eventos, formatFechaEvento, type Evento } from "@/lib/data/eventos";

const fechaKey = (fecha: Dayjs) => fecha.format("YYYY-MM-DD");

/**
 * Calendario de próximos eventos (client component: antd Calendar es interactivo).
 * Marca con puntos los días con actividades y abre un Modal con el detalle del día.
 * En pantallas ≤ 640 px usa la variante compacta del calendario.
 */
export default function EventosCalendar() {
  const eventosPorFecha = useMemo(() => {
    const mapa = new Map<string, Evento[]>();
    for (const ev of eventos) {
      mapa.set(ev.fecha, [...(mapa.get(ev.fecha) ?? []), ev]);
    }
    return mapa;
  }, []);

  const [diaSeleccionado, setDiaSeleccionado] = useState<Dayjs | null>(null);
  const [compacto, setCompacto] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const actualizar = () => setCompacto(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);

  const eventosDelDia = diaSeleccionado
    ? (eventosPorFecha.get(fechaKey(diaSeleccionado)) ?? [])
    : [];

  return (
    <>
      <Calendar
        fullscreen={!compacto}
        onSelect={(fecha, { source }) => {
          if (source === "date" && eventosPorFecha.has(fechaKey(fecha))) {
            setDiaSeleccionado(fecha);
          }
        }}
        cellRender={(fecha, info) => {
          if (info.type !== "date") return info.originNode;
          const eventosDia = eventosPorFecha.get(fechaKey(fecha));
          const clases = ["celda-calendario"];
          if (eventosDia) clases.push("celda-calendario--con-evento");
          if (fecha.isSame(dayjs(), "day")) clases.push("celda-calendario--hoy");
          return (
            <div className={clases.join(" ")}>
              <span>{fecha.date()}</span>
              <span className="celda-calendario__puntos">
                {eventosDia?.map((ev) => (
                  <span key={ev.titulo} className="celda-calendario__punto" />
                ))}
              </span>
            </div>
          );
        }}
      />
      <Modal
        open={diaSeleccionado !== null}
        title={
          diaSeleccionado ? formatFechaEvento(fechaKey(diaSeleccionado)) : ""
        }
        footer={null}
        onCancel={() => setDiaSeleccionado(null)}
      >
        {eventosDelDia.map((ev) => (
          <div key={ev.titulo} className="evento-modal-item">
            <strong>
              {ev.hora} hrs — {ev.titulo}
            </strong>
            <p>{ev.descripcion}</p>
          </div>
        ))}
      </Modal>
    </>
  );
}
