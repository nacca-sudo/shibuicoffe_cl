/** URL pública del sitio (placeholder — actualizar al dominio real en producción) */
export const SITE_URL = "https://shibuicafe.cl";

/** Formatea un precio en CLP (enteros, sin decimales): 9900 → "$9.900" */
export function formatCLP(precio: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(precio);
}
