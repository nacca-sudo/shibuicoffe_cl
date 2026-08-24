## PROMPT

Actúa como un arquitecto de software senior especializado en aplicaciones full-stack con Next.js. Tu tarea NO es escribir código todavía. Tu tarea es generar un **PLAN de proyecto detallado y accionable** para construir un sitio web de ecommerce para una cafetería.

### Contexto del negocio

- Es el sitio web de una cafetería física.
- El sitio debe tener dos grandes bloques:
  1. **Landing page de presentación**: historia de la cafetería, ubicación, horarios, menú de bebidas/comida en tienda física, fotos, contacto, redes sociales.
  2. **Tienda online (ecommerce)**: venta de accesorios y productos de merchandising, tales como blends de café en grano/molido, poleras, tazas, y otros accesorios de marca.

### Stack técnico obligatorio

- **Framework**: Next.js (App Router)
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **UI Kit**: Ant Design
- **Pagos**: pasarela de pago real (a definir cuál, propone alternativas viables para Chile
- **Hosting sugerido**: propón opciones (Vercel, Railway, u otro) considerando que necesitamos DB persistente y variables de entorno seguras para la pasarela de pago

### Qué debe incluir el PLAN

1. **Arquitectura general**
   - Estructura de carpetas del proyecto (App Router, componentes, lib, api routes, etc.)
   - Separación clara entre las rutas de landing y las rutas de tienda

2. **Modelo de datos (schema Prisma)**
   - Entidades necesarias: Producto, Categoría (café, poleras, tazas, otros), Variante de producto (si aplica: talla/color para poleras, gramaje para café), Pedido, ItemPedido, Cliente/Usuario, Dirección de envío, Estado de pago
   - Relaciones entre entidades
   - Justifica cada campo relevante

3. **Funcionalidades del ecommerce**
   - Catálogo con filtros (categoría, precio, disponibilidad)
   - Ficha de producto con variantes
   - Carrito de compras (persistencia: sesión, localStorage o DB — recomienda la mejor opción y justifica)
   - Checkout y flujo de pago
   - Confirmación de pedido y notificación (email)
   - Panel de administración básico (CRUD de productos, gestión de pedidos, gestión de stock, gestion de roles de usuario como administrador)

4. **Funcionalidades de la landing**
   - Secciones sugeridas (hero, historia, menú, galería, ubicación con mapa, contacto)
   - Cómo se conecta (o no) con el ecommerce en términos de navegación

5. **Autenticación y roles**
   - ¿Compra como invitado, con cuenta, o ambos?
   - Rol de administrador para gestionar la tienda

6. **Integración de pagos**
   - Flujo completo: creación de sesión de pago → webhook de confirmación → actualización de estado del pedido en la base de datos
   - Manejo de casos de error o pago fallido

7. **Gestión de stock e inventario**
   - Cómo se descuenta stock al confirmar pago
   - Qué pasa si dos usuarios compran el último producto en simultáneo (condición de carrera)

8. **Fases de desarrollo (roadmap)**
   - Divide el proyecto en fases/sprints priorizados (ej: Fase 1 – Landing + catálogo estático, Fase 2 – Carrito y checkout, Fase 3 – Pagos reales, Fase 4 – Panel admin, Fase 5 – Optimización y despliegue)
   - Indica dependencias entre fases

9. **Consideraciones no funcionales**
   - SEO para la landing
   - Rendimiento (imágenes de productos, carga de catálogo)
   - Seguridad (validación de inputs, protección de rutas admin, manejo seguro de webhooks de pago)
   - Responsive / mobile-first

10. **Riesgos y decisiones abiertas**
    - Lista explícita de preguntas o decisiones que requieren mi input antes de comenzar a codear (ej: país/moneda, proveedor de pago, si habrá envíos o solo retiro en tienda, etc.)

### Formato de salida

Entrega el plan en formato Markdown, bien estructurado con títulos y subtítulos, usando las secciones numeradas arriba. No escribas código todavía — este documento es solo el plan. Al final, incluye una sección "Siguiente paso sugerido" indicando con qué fase/parte recomiendas empezar a codear primero.

---

*Fin del prompt.*
