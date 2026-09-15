/** URL pública del sitio (placeholder — actualizar al dominio real en producción) */
export const SITE_URL = "https://shibuicafe.cl";

// TODO(decisión abierta #3 del plan): tarifa plana provisoria
/** Costo de envío a domicilio en CLP (tarifa plana única; el retiro en tienda es gratis) */
export const COSTO_ENVIO_CLP = 3500;

/** Formatea un precio en CLP (enteros, sin decimales): 9900 → "$9.900" */
export function formatCLP(precio: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(precio);
}
