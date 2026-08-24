# Prompt para agente: Desarrollo del Ecommerce — Cafetería

Usa este prompt DESPUÉS de haber generado y revisado el PLAN (prompt anterior). Este prompt le pide al agente construir el proyecto de forma iterativa, no todo de una vez.

---

## PROMPT

Actúa como un desarrollador full-stack senior. Vas a construir el sitio web de una cafetería con landing page + tienda online (ecommerce), siguiendo el PLAN que ya generamos y validamos previamente [pega aquí el plan, o referencia el archivo si tu agente puede leerlo del proyecto].

### Reglas de trabajo

1. **Trabaja de forma incremental**, fase por fase, siguiendo el roadmap del plan. No intentes generar todo el proyecto en una sola respuesta.
2. **Antes de cada fase**, resume en 2-3 líneas qué vas a construir y qué archivos vas a crear/modificar.
3. **Después de cada fase**, indica cómo probarla (comandos a correr, rutas a visitar) antes de avanzar a la siguiente.
4. Si encuentras una decisión de diseño no cubierta por el plan (ej: nombre de una tabla, estructura de una carpeta), toma la decisión más estándar/idiomática para el stack y explícala brevemente — no te detengas a preguntar por cosas menores.
5. Si encuentras una decisión que sí requiere mi input (ej: proveedor de pago final, dominio, credenciales), detente y pregúntame explícitamente antes de continuar.

### Stack técnico

- **Framework**: Next.js (App Router), TypeScript
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **UI Kit**: Ant Design (usa sus componentes en vez de construir UI desde cero cuando sea razonable: Table, Form, Card, Modal, Drawer para el carrito, etc.)
- **Pagos**: [nombre de la pasarela definida en el plan]
- **Gestión de estado del carrito**: [según lo definido en el plan — ej. Zustand, Context API, o DB]

### Fase 0 — Setup del proyecto

- Inicializa el proyecto Next.js con TypeScript
- Instala y configura Prisma, conecta a PostgreSQL (usa variables de entorno en `.env`, nunca hardcodees credenciales)
- Instala y configura Ant Design (incluyendo soporte para App Router / SSR si aplica)
- Configura ESLint/Prettier básico
- Crea la estructura de carpetas definida en el plan
- Entrega un `.env.example` con todas las variables necesarias documentadas

### Fase 1 — Modelo de datos

- Escribe el `schema.prisma` completo según el modelo de datos del plan
- Genera y corre la migración inicial
- Crea un script de `seed` con datos de ejemplo (mínimo: 3 categorías, 8-10 productos con variantes, incluyendo blends de café, poleras y tazas)

### Fase 2 — Landing page

- Construye las secciones definidas en el plan (hero, historia, menú, galería, ubicación, contacto)
- Usa componentes de Ant Design donde tenga sentido (Layout, Menu, Card, Carousel para galería)
- Asegura que sea responsive (mobile-first)
- Deja preparados los metadatos básicos de SEO (title, description, Open Graph)

### Fase 3 — Catálogo de la tienda

- Página de listado de productos con filtros por categoría y estado de disponibilidad
- Página de detalle de producto con selección de variantes
- Componente de carrito (agregar, quitar, actualizar cantidad, ver subtotal)
- Persistencia del carrito según lo definido en el plan

### Fase 4 — Checkout y pagos

- Flujo de checkout: datos de envío/retiro → resumen del pedido → redirección a la pasarela de pago
- API route para crear la sesión/orden de pago
- Webhook para confirmar el pago y actualizar el estado del pedido en la base de datos
- Manejo de estados: pendiente, pagado, fallido, cancelado
- Página de confirmación de pedido

### Fase 5 — Gestión de stock

- Descuento de stock al confirmar el pago (no al agregar al carrito)
- Manejo de condición de carrera cuando el stock es limitado (usa transacciones de Prisma)
- Bloqueo de compra si el producto queda sin stock

### Fase 6 — Panel de administración

- Ruta protegida `/admin` (define y aplica el mecanismo de autenticación del plan)
- CRUD de productos y categorías
- Listado y gestión de estado de pedidos
- Ajuste manual de stock

### Fase 7 — Pulido final

- Revisión de rendimiento (optimización de imágenes con `next/image`, lazy loading del catálogo)
- Revisión de seguridad (validación de inputs con una librería como Zod, protección de rutas admin, verificación de firma en webhooks de pago)
- Pruebas manuales del flujo completo: navegar landing → ver producto → agregar al carrito → checkout → pago → confirmación → verificar en admin
- Preparación para despliegue (variables de entorno de producción, checklist de deploy)

### Formato de trabajo esperado

Para cada fase: código completo de los archivos nuevos/modificados, comando(s) para instalar dependencias si aplica, y breve explicación de decisiones no triviales. Al terminar cada fase, pregunta si avanzas a la siguiente o si necesito ajustar algo primero.

---

*Fin del prompt.*
