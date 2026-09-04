import dayjs from "dayjs";
import "dayjs/locale/es";

/**
 * Próximos eventos de la cafetería (landing).
 * Contenido estático gestionado por el equipo técnico.
 * TODO(fase-4): migrar a DB + CRUD en el panel admin si el cliente quiere editarlo solo.
 */

export type Evento = {
  titulo: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
};

export const eventos: Evento[] = [
  {
    titulo: "Cata de cafés de origen",
    descripcion:
      "Recorrido guiado por tres orígenes de la temporada, con notas de cata y maridaje.",
    fecha: "2026-09-05",
    hora: "11:00",
  },
  {
    titulo: "Taller de latte art",
    descripcion:
      "Aprende los fundamentos del vertido: corazón, tulipán y rosetta. Incluye práctica en máquina.",
    fecha: "2026-09-12",
    hora: "16:00",
  },
  {
    titulo: "Noche de jazz & cold brew",
    descripcion:
      "Música en vivo con trío local y carta especial de cold brew y pastelería nocturna.",
    fecha: "2026-09-18",
    hora: "19:30",
  },
  {
    titulo: "Cupping de métodos filtrados",
    descripcion:
      "Comparativa del mismo café en V60, Chemex y Aeropress. Cupo limitado a 12 personas.",
    fecha: "2026-09-26",
    hora: "11:00",
  },
  {
    titulo: "Taller de barismo casero",
    descripcion:
      "Cómo lograr un buen espresso en casa: molienda, proporciones y errores comunes.",
    fecha: "2026-10-03",
    hora: "16:00",
  },
  {
    titulo: "Cata de temporada: cosecha Colombia",
    descripcion:
      "Primera cata pública de la nueva cosecha de Huila antes de su lanzamiento en tienda.",
    fecha: "2026-10-10",
    hora: "11:00",
  },
];

/** "sábado 5 de septiembre" */
export function formatFechaEvento(fecha: string): string {
  return dayjs(fecha).locale("es").format("dddd D [de] MMMM");
}

/** Número del día: "5" */
export function diaDeEvento(fecha: string): string {
  return dayjs(fecha).format("D");
}

/** Mes abreviado: "sept" */
export function mesDeEvento(fecha: string): string {
  return dayjs(fecha).locale("es").format("MMM");
}
