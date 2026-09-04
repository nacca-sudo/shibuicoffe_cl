import { z } from "zod";

/** Ítem de carrito tal como llega desde el cliente (solo identidad + cantidad; el precio nunca se confía) */
export const itemCarritoSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().positive("La cantidad debe ser al menos 1"),
});

export const direccionSchema = z.object({
  calle: z.string().trim().min(1, "Ingresa la calle"),
  numero: z.string().trim().min(1, "Ingresa el número"),
  comuna: z.string().trim().min(1, "Ingresa la comuna"),
  ciudad: z.string().trim().min(1, "Ingresa la ciudad"),
  region: z.string().trim().min(1, "Selecciona la región"),
  notas: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

/** Input completo del checkout (invitado). Si el método es SHIPPING, la dirección es obligatoria */
export const checkoutSchema = z
  .object({
    nombre: z.string().trim().min(2, "Ingresa tu nombre"),
    email: z.email("Ingresa un email válido"),
    telefono: z.string().trim().min(8, "Ingresa un teléfono válido"),
    metodoEntrega: z.enum(["PICKUP", "SHIPPING"]),
    direccion: direccionSchema.optional(),
    items: z.array(itemCarritoSchema).min(1, "El carrito está vacío"),
  })
  .refine((datos) => datos.metodoEntrega !== "SHIPPING" || datos.direccion !== undefined, {
    message: "Ingresa la dirección de envío",
    path: ["direccion"],
  });

export type ItemCarritoInput = z.infer<typeof itemCarritoSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
