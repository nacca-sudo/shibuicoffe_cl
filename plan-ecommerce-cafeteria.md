# Plan de Proyecto — Sitio Web Ecommerce para Cafetería

> Documento de planificación. **No contiene código de implementación.** Define arquitectura, modelo de datos, funcionalidades, roadmap y decisiones abiertas antes de escribir la primera línea.

---

## 1. Arquitectura general

### 1.1 Visión general

Una sola aplicación Next.js (App Router) que aloja los dos grandes bloques del negocio:

- **Landing institucional** (cafetería física): rutas públicas, pensadas para SEO y carga rápida.
- **Tienda online** (ecommerce): rutas con lógica de negocio, carrito, checkout y panel de administración.

Se usa **Route Groups** de Next.js para separar ambos mundos sin afectar las URLs, y un tercer grupo para el panel admin con su propio layout y protección.

### 1.2 Estructura de carpetas propuesta

```
shibui_shop/
├── prisma/
│   ├── schema.prisma              # Modelo de datos (sección 2)
│   └── seed.ts                    # Datos iniciales: categorías, productos demo, admin
├── public/                        # Imágenes estáticas de la landing (hero, galería)
├── src/
│   ├── app/
│   │   ├── (landing)/             # Route group: cafetería física
│   │   │   ├── layout.tsx         # Layout público (header/footer institucional)
│   │   │   ├── page.tsx           # "/" — Home: hero, historia, menú, galería, mapa, contacto
│   │   │   └── menu/page.tsx      # (opcional) menú completo en página propia
│   │   ├── (shop)/                # Route group: ecommerce
│   │   │   ├── layout.tsx         # Layout tienda (header con carrito)
│   │   │   ├── tienda/page.tsx    # "/tienda" — catálogo con filtros
│   │   │   ├── tienda/[slug]/page.tsx      # Ficha de producto
│   │   │   ├── tienda/categoria/[slug]/page.tsx
│   │   │   ├── carrito/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── pedido/[id]/page.tsx        # Confirmación / estado del pedido
│   │   │   └── cuenta/                     # (opcional) cuenta de cliente
│   │   ├── admin/                 # Panel de administración (protegido por middleware)
│   │   │   ├── layout.tsx         # Layout admin (sidebar Ant Design)
│   │   │   ├── page.tsx           # Dashboard: ventas recientes, stock bajo
│   │   │   ├── productos/         # CRUD productos y variantes
│   │   │   ├── categorias/
│   │   │   ├── pedidos/           # Gestión de pedidos y estados
│   │   │   └── usuarios/          # Gestión de roles
│   │   ├── api/
│   │   │   ├── webhooks/pagos/route.ts     # Webhook de la pasarela (firma verificada)
│   │   │   └── auth/[...nextauth]/route.ts # Auth.js
│   │   ├── actions/               # Server Actions (carrito→pedido, admin CRUD)
│   │   ├── sitemap.ts / robots.ts # SEO
│   │   └── layout.tsx             # Root layout (Ant Design Registry, fuentes)
│   ├── components/
│   │   ├── landing/               # Hero, Historia, MenuCafeteria, Galeria, Mapa, Contacto
│   │   ├── shop/                  # ProductCard, ProductGrid, Filtros, VariantSelector, CartDrawer
│   │   ├── admin/                 # ProductForm, OrderTable, StockBadge…
│   │   └── shared/                # Header, Footer, Logo, botones comunes
│   ├── lib/
│   │   ├── db.ts                  # Cliente Prisma (singleton)
│   │   ├── auth.ts                # Configuración Auth.js + helpers de sesión/rol
│   │   ├── payments/              # Cliente de la pasarela elegida (crear sesión, verificar webhook)
│   │   ├── cart/                  # Store del carrito (Zustand) + tipos
│   │   ├── email/                 # Envío de correos (Resend) + plantillas
│   │   ├── validations/           # Esquemas Zod (checkout, producto, login…)
│   │   └── utils.ts
│   ├── types/
│   └── middleware.ts              # Protección de /admin por rol
├── .env.example                   # DATABASE_URL, claves pasarela, RESEND_API_KEY, AUTH_SECRET…
└── package.json
```

### 1.3 Separación landing vs. tienda

- **Navegación compartida**: un header común con logo, links a secciones de la landing (anclas o rutas del grupo `(landing)`) y un CTA destacado "Tienda" que lleva a `/tienda`. En la tienda, el logo devuelve a `/`.
- **Layouts distintos**: la landing usa un layout editorial (sin carrito); la tienda agrega el ícono de carrito con badge y el drawer de carrito.
- **Datos**: la landing es 100 % contenido estático/renderizado en servidor (idealmente SSG/ISR); la tienda consume la base de datos vía Prisma.

---

## 2. Modelo de datos (schema Prisma)

### 2.1 Entidades y campos

**`Category`** — Agrupa el catálogo.

| Campo | Tipo | Justificación |
|---|---|---|
| `id` | cuid | PK |
| `name` | string | "Café", "Poleras", "Tazas", "Accesorios" |
| `slug` | string único | URLs amigables (`/tienda/categoria/cafe`) y SEO |
| `image` | string? | Imagen de portada de categoría |

**`Product`** — El producto "lógico"; los detalles vendibles viven en las variantes.

| Campo | Tipo | Justificación |
|---|---|---|
| `id`, `name`, `slug` (único) | — | Identidad y URL de la ficha |
| `description` | text | Ficha de producto (notas de cata, material, etc.) |
| `basePrice` | int (CLP) | Precio de referencia/mínimo; el precio real de venta está en la variante |
| `images` | string[] | Galería de la ficha (URLs del storage) |
| `categoryId` | FK → Category | Filtro principal del catálogo |
| `isActive` | bool | Permite ocultar sin borrar (soft-delete) |
| `createdAt`/`updatedAt` | timestamps | Orden "novedades" y auditoría |

> **Precios como enteros en pesos chilenos**: CLP no tiene decimales; guardar `int` evita errores de redondeo de floats.

**`ProductVariant`** — La unidad realmente vendible (lo que tiene SKU y stock).

| Campo | Tipo | Justificación |
|---|---|---|
| `id` | cuid | PK |
| `productId` | FK → Product | Pertenece a un producto |
| `name` | string | Etiqueta legible: "250 g molido", "Talla M negra" |
| `sku` | string único | Identificación para inventario y conciliación |
| `price` | int (CLP) | El precio de venta real de esa variante |
| `stock` | int | Unidades disponibles; **solo se descuenta aquí** |
| `attributes` | json | Flexible: `{talla, color}` para poleras, `{gramaje, molienda}` para café — evita columnas rígidas por tipo de producto |
| `isActive` | bool | Desactivar tallas agotadas permanentemente, etc. |

> **¿Por qué variantes y no productos planos?** Una polera tiene tallas y un café tiene gramajes/moliendas; sin variantes habría que duplicar fichas o mezclar stock. Con `attributes` JSON el modelo sirve para cualquier categoría futura sin migraciones.

**`User`** — Clientes registrados y administradores.

| Campo | Tipo | Justificación |
|---|---|---|
| `id`, `email` (único), `name` | — | Identidad |
| `passwordHash` | string? | Null si entra solo con OAuth (Google) |
| `role` | enum `Role { CUSTOMER, ADMIN }` | Protección del panel `/admin` |
| `createdAt` | timestamp | Auditoría |

**`Order`** — Cabecera del pedido.

| Campo | Tipo | Justificación |
|---|---|---|
| `id` | cuid | PK; también sirve como número de pedido visible |
| `userId` | FK → User, **nullable** | Soporta compra como invitado (sección 5) |
| `guestEmail` / `guestName` / `guestPhone` | string? | Contacto cuando no hay cuenta |
| `status` | enum `OrderStatus` | Ver ciclo de vida abajo |
| `total` / `shippingCost` | int (CLP) | Totales **congelados al crear el pedido** — nunca se recalculan desde el precio actual del producto |
| `deliveryMethod` | enum `{ PICKUP, SHIPPING }` | Retiro en tienda o despacho |
| `shippingAddressId` | FK → Address, nullable | Null si es retiro |
| `paymentProvider` | string | "flow" / "mercadopago" — permite cambiar de pasarela sin migrar |
| `paymentId` | string único? | ID de la transacción en la pasarela; **clave de idempotencia del webhook** |
| `createdAt`/`paidAt` | timestamps | Métricas y conciliación |

**`OrderItem`** — Línea del pedido (snapshot histórico).

| Campo | Tipo | Justificación |
|---|---|---|
| `orderId` | FK → Order | |
| `variantId` | FK → ProductVariant | Trazabilidad al SKU comprado |
| `quantity` | int | |
| `unitPrice` / `productName` / `variantName` | copiados | El pedido no cambia aunque el producto se edite o borre después |

**`Address`** — Dirección de envío (de usuario registrado o capturada en checkout de invitado).

| Campo | Tipo | Justificación |
|---|---|---|
| `userId` | FK → User, nullable | |
| `street`, `number`, `comuna`, `ciudad`, `region` | strings | Formato de dirección chileno |
| `notes` | string? | "Depto 302", indicaciones al repartidor |

**Enums principales**

- `OrderStatus`: `PENDING_PAYMENT` → `PAID` → `PREPARING` → `SHIPPED`/`READY_FOR_PICKUP` → `COMPLETED`; ramas `PAYMENT_FAILED`, `CANCELLED`, `REFUNDED`.
- `PaymentStatus` (si se modela como tabla `Payment` separada): `PENDING`, `APPROVED`, `REJECTED`, `REFUNDED`. — *Alternativa simple: guardar el estado de pago como campo del `Order`. Para un negocio de este tamaño, el campo en `Order` basta; tabla `Payment` solo si se esperan múltiples intentos de pago por pedido.*

### 2.2 Relaciones (resumen)

- `Category` 1—N `Product`
- `Product` 1—N `ProductVariant`
- `User` 1—N `Order` / `Address` (ambas nullable para invitados)
- `Order` 1—N `OrderItem`; `OrderItem` N—1 `ProductVariant`

---

## 3. Funcionalidades del ecommerce

### 3.1 Catálogo con filtros

- Grid de `ProductCard` (Ant Design `Card` + imagen + precio desde su variante mínima + badge "Sin stock" si todas las variantes están en 0).
- Filtros server-side vía search params (`?categoria=cafe&min=5000&max=20000&disponible=true`): categoría, rango de precio, disponibilidad, orden (precio asc/desc, novedades).
- Paginación (o scroll paginado) desde el servidor.

### 3.2 Ficha de producto

- Galería de imágenes, descripción, selector de variante (talla/gramaje/molienda), precio y stock de la variante seleccionada, selector de cantidad, botón "Agregar al carrito" (deshabilitado si `stock = 0`).
- Renderizado SSG/ISR con `generateStaticParams` por slug → velocidad + SEO.

### 3.3 Carrito de compras — decisión de persistencia

**Recomendación: carrito en el cliente (Zustand + `localStorage`), revalidado en el servidor al iniciar el checkout.**

Justificación:

- El grueso de los compradores serán **invitados**; un carrito en DB obliga a crear sesiones anónimas, limpiar carritos huérfanos y escribir en DB en cada visita.
- `localStorage` sobrevive al cierre del navegador y no requiere cookies ni consentimiento.
- **Los precios y el stock nunca se confían al cliente**: al hacer checkout, un Server Action recibe `[{variantId, quantity}]`, consulta precios y stock reales en DB, y construye el `Order` con esos valores. El carrito del cliente es solo una "intención".
- Si más adelante se quiere carrito sincronizado entre dispositivos para usuarios con cuenta, se agrega una tabla `CartItem` sin cambiar el flujo de invitados.

### 3.4 Checkout

1. Resumen del carrito (revalidado) + formulario: nombre, email, teléfono.
2. Método de entrega: **Retiro en tienda** (gratis) o **Envío** (formulario de dirección; costo plano por región o tarifa única — decisión abierta, sección 10).
3. Resumen final con total → botón "Pagar" → Server Action crea el `Order` en estado `PENDING_PAYMENT` y redirige a la pasarela (sección 6).

### 3.5 Confirmación de pedido y notificación

- Página `/pedido/[id]` con estado del pedido (consultada por token/id + email).
- Email transaccional con **Resend** (alternativas: SendGrid, AWS SES):
  - Al cliente: confirmación con detalle del pedido e instrucciones de retiro/envío.
  - Al admin: aviso "nuevo pedido pagado".
  - Plantillas en React Email.

### 3.6 Panel de administración (`/admin`)

- **Dashboard**: ventas del día/semana, pedidos pendientes, variantes con stock bajo.
- **Productos**: CRUD de productos, categorías y variantes (formularios Ant Design + Server Actions + Zod), carga de imágenes a un storage (Vercel Blob, Cloudinary o S3).
- **Pedidos**: tabla filtrable por estado; cambio de estado (`PAID → PREPARING → SHIPPED…`), vista de detalle.
- **Stock**: edición directa de `stock` por variante, con registro visual de movimientos.
- **Usuarios**: listar usuarios y cambiar `role` (solo un admin puede crear/elevar admins; el primer admin se crea por seed).

---

## 4. Funcionalidades de la landing

### 4.1 Secciones (página única con anclas, salvo que el contenido crezca)

1. **Hero**: foto principal, nombre, propuesta de valor, CTAs "Ver menú" y "Visitar tienda".
2. **Historia**: texto + fotos del local/origen.
3. **Menú de la cafetería**: **PDF descargable** (decisión del cliente: el menú no se muestra renderizado en la página). La sección lleva solo un texto breve y el botón de descarga a `public/menu-shibui.pdf` — placeholder generado con `scripts/generate-menu-pdf.mjs` hasta recibir el PDF real.
4. **Próximos eventos**: sección en forma de calendario (antd Calendar) con las actividades de la cafetería (catas, talleres, música en vivo). Días con eventos marcados con puntos; al seleccionar un día se abre el detalle. Se complementa con una agenda en lista (server-rendered). Datos estáticos en `src/lib/data/eventos.ts`, migrables a DB + CRUD admin en Fase 4 si el cliente quiere editarlos solo.
5. **Galería**: carrusel de fotos (antd Carousel con flechas, puntos y swipe táctil) con imágenes optimizadas vía `next/image`.
6. **Ubicación y horarios**: mapa embebido (Google Maps iframe — simple y gratis) + dirección + horario de atención.
7. **Contacto y redes**: email, teléfono/WhatsApp, Instagram/Facebook. Formulario de contacto opcional (envío por email vía Resend) o solo mailto para la v1.

### 4.2 Conexión con el ecommerce

- Mismo header global: la navegación de la landing usa anclas (`/#menu`, `/#ubicacion`) y el link "Tienda" cruza a `/tienda`.
- La landing **no** muestra carrito; la tienda sí.
- Cross-selling: sección opcional en la home con 3–4 productos destacados del catálogo (lee de la DB, ISR) que linkean a sus fichas.

---

## 5. Autenticación y roles

- **Compra como invitado: permitida (recomendado como vía principal).** Menos fricción = más conversión. Solo se pide nombre, email y teléfono.
- **Cuenta de cliente: opcional.** Beneficio: historial de pedidos y direcciones guardadas. El alta puede ofrecerse *después* de comprar ("guarda tus datos para la próxima").
- **Autenticación con Auth.js v5 (next-auth)**: credenciales (email + password con bcrypt) y opcionalmente Google OAuth. Sesiones con JWT.
- **Roles**: enum `Role { CUSTOMER, ADMIN }`. El middleware protege todo `/admin/**` exigiendo `role = ADMIN`; cada Server Action administrativo revalida el rol en el servidor (nunca confiar solo en el middleware).
- El primer usuario `ADMIN` se crea vía `prisma/seed.ts` con credenciales de entorno.

---

## 6. Integración de pagos

### 6.1 Alternativas viables para Chile

| Pasarela | Pros | Contras |
|---|---|---|
| **Mercado Pago** (Checkout Pro) | Integración rápida y bien documentada; acepta tarjetas, débito, cuenta MP; webhooks maduros; SDK oficial | Comisión algo mayor; la marca MP es visible al pagar |
| **Flow** | Chilena; acepta tarjetas vía Webpay, transferencias; buena API con firma HMAC; soporte local | Documentación menos pulida que MP |
| **Webpay Plus (Transbank)** | El estándar de confianza en Chile; comisiones menores en volúmenes altos | Integración más compleja (SDK, certificación, ambiente de integración) |
| **Khipu / Fintoc** | Transferencias con comisión baja | Sin tarjetas como método principal |

**Recomendación inicial: Mercado Pago o Flow** (integración en días, medios de pago chilenos, webhooks confiables). Migrar a Webpay Plus más adelante es posible gracias al campo `paymentProvider` del pedido. *Decisión final pendiente del cliente (sección 10).*

### 6.2 Flujo completo

1. **Checkout** → Server Action `createOrder`: valida carrito contra DB (precios, stock), crea `Order (PENDING_PAYMENT)` + `OrderItem`s con precios congelados.
2. **Sesión de pago** → se crea la preferencia/orden en la pasarela con `orderId` como referencia externa y la URL de webhook; se redirige al usuario a la pasarela.
3. **Retorno del usuario** → la pasarela lo devuelve a `/pedido/[id]` (que muestra "procesando pago" hasta confirmar).
4. **Webhook (fuente de verdad)** → `POST /api/webhooks/pagos`:
   - Verifica firma/secret del webhook. **Si no verifica → 401, fin.**
   - **Idempotencia**: si ya existe un pedido con ese `paymentId` en estado `PAID`, responde 200 sin hacer nada (las pasarelas reintentan).
   - Si el pago fue **aprobado** → transacción DB: descontar stock (sección 7) + marcar `Order` como `PAID` (`paidAt`) + guardar `paymentId` → encolar emails de confirmación.
   - Si fue **rechazado** → `Order` pasa a `PAYMENT_FAILED`; el stock nunca se tocó.
5. **Timeout de abandono**: job periódico (Vercel Cron) que marca como `CANCELLED` los pedidos `PENDING_PAYMENT` con más de X horas.

### 6.3 Manejo de errores y pago fallido

- Pago rechazado: página de pedido muestra el fallo y botón "Reintentar pago" (crea una nueva sesión de pago sobre el mismo `Order` si aún hay stock).
- Discrepancia usuario/webhook (el usuario vuelve antes que llegue el webhook): la página de pedido consulta el estado real a la API de la pasarela como fallback de solo lectura.
- Toda respuesta del webhook se registra (log) para conciliación.

---

## 7. Gestión de stock e inventario

### 7.1 Cuándo se descuenta

**Solo al confirmar el pago (webhook)**, no al agregar al carrito ni al crear el pedido. Un carrito o un pedido `PENDING_PAYMENT` no comprometen stock; así el abandono no congela inventario.

*(Alternativa evaluada: reservar stock al crear la sesión de pago con expiración. Se descarta para la v1 por complejidad; se puede agregar si hay ventas flash con alta concurrencia.)*

### 7.2 Condición de carrera (dos compradores, última unidad)

El descuento se ejecuta **dentro de una transacción Prisma con decremento atómico condicional**:

- Por cada ítem: `UPDATE "ProductVariant" SET stock = stock - qty WHERE id = ? AND stock >= qty` (vía `updateMany`, que retorna filas afectadas).
- Si alguna fila afectada es 0 (stock insuficiente) → **rollback completo**: el pedido no pasa a `PAID`.

### 7.3 Qué pasa cuando el pago ya se cobró pero no hay stock (oversell)

Es la ventana entre "checkout OK" y "webhook". Política propuesta:

1. Se marca el pedido como `PAID` **solo si la transacción de stock tuvo éxito**.
2. Si falla por stock: el pedido queda en estado `PAID_STOCK_ISSUE` (o `PAID` + flag), se alerta al admin por email, y se gestiona manualmente: reponer, ofrecer sustituto o **reembolso** desde el panel de la pasarela, marcando el pedido `REFUNDED`.
3. Mitigación adicional: al **crear** la sesión de pago se revalida que haya stock (reduce la ventana a segundos); con volúmenes de cafetería, la probabilidad real de oversell es mínima.

### 7.4 Reglas operativas

- Nunca vender variantes con `stock = 0` (botón deshabilitado + validación server-side).
- Umbral de "stock bajo" configurable para alertas en el dashboard admin.
- Ajustes manuales de stock desde el panel admin (recepción de mercadería, mermas).

---

## 8. Fases de desarrollo (roadmap)

| Fase | Contenido | Entregable | Depende de |
|---|---|---|---|
| **0. Setup** (2–3 días) | Repo, Next.js + TS, Ant Design + theming (paleta de la marca), Prisma + PostgreSQL local (Docker), `.env` y CI básico | Proyecto base que corre | — |
| **1. Landing + catálogo** (1–2 sem) | Landing completa (hero, historia, menú, galería, mapa, contacto); schema Prisma + seed; catálogo con filtros y ficha de producto (sin compra) | Sitio navegable con catálogo real | Fase 0 |
| **2. Carrito y checkout simulado** (1 sem) | Store del carrito, drawer, página de checkout, creación de `Order` en `PENDING_PAYMENT`, página de pedido; "pago" simulado por un botón en entorno dev | Flujo de compra completo sin dinero real | Fase 1 |
| **3. Pagos reales + notificaciones** (1–2 sem) | Integración pasarela (sandbox → producción), webhook con verificación e idempotencia, descuento transaccional de stock, emails (Resend), cron de pedidos abandonados | Ventas reales end-to-end | Fase 2 |
| **4. Auth + panel admin** (1–2 sem) | Auth.js, roles, middleware, dashboard, CRUD productos/variantes/categorías, gestión de pedidos y stock, gestión de usuarios | Operación diaria sin tocar la DB | Fases 1–3 (el CRUD puede paralelizarse con la Fase 3 si hay otro desarrollador) |
| **5. Endurecimiento y despliegue** (1 sem) | SEO (metadata, sitemap, JSON-LD), performance (imágenes, ISR), rate limiting, revisión de seguridad, despliegue producción + DB gestionada, monitoreo | Lanzamiento | Todas |

**Dependencias críticas**: el modelo de datos (Fase 1) es la base de todo; pagos (Fase 3) requiere el flujo de pedido de la Fase 2; el admin (Fase 4) requiere entidades y pedidos existentes.

**Camino crítico**: 0 → 1 → 2 → 3 → 5. Fase 4 es paralelizable parcialmente.

---

## 9. Consideraciones no funcionales

### 9.1 SEO (prioridad: la landing)

- Metadata API de Next.js por página (títulos, descripciones, Open Graph con imágenes).
- `sitemap.ts` y `robots.ts` generados; URLs canónicas y slugs legibles.
- **JSON-LD `LocalBusiness`/`CafeOrCoffeeShop`** en la landing (dirección, horarios, teléfono) → rich results en Google.
- Fichas de producto pre-renderizadas (SSG/ISR) con JSON-LD `Product` (precio, disponibilidad).
- Core Web Vitals: LCP controlado en el hero (imagen priorizada), fuentes con `next/font`.

### 9.2 Rendimiento

- Todas las imágenes con `next/image` (WebP/AVIF automático, lazy loading); las de productos subidas a storage con CDN.
- Catálogo: paginación server-side (no cargar todo), ISR con revalidación al editar productos (`revalidatePath` desde el admin).
- Landing esencialmente estática (SSG) → TTFB mínimo.
- Ant Design: importar componentes usados, tema vía `ConfigProvider` con tokens de marca.

### 9.3 Seguridad

- Validación de **todo** input de usuario con Zod, tanto en cliente (UX) como en Server Actions/API (seguridad real).
- `/admin` protegido por middleware **y** revalidación de rol en cada Server Action.
- Webhooks: verificación de firma obligatoria, idempotencia por `paymentId`, respuestas 200 rápidas y procesamiento con logs.
- Prisma = queries parametrizadas (sin SQL injection); nunca exponer el cliente Prisma al browser.
- Secrets solo en variables de entorno del servidor (`.env` fuera del repo; `.env.example` documentado).
- Rate limiting básico en rutas sensibles (checkout, login, webhook) — Upstash Rate Limit o middleware propio.
- HTTPS obligatorio; headers de seguridad (`next.config`).

### 9.4 Responsive / mobile-first

- Gran parte del tráfico será móvil (Instagram → landing/tienda). Grid y breakpoints de Ant Design (`Row`/`Col`, `xs`–`lg`), drawer de carrito pensado para móvil, CTAs con tamaño táctil ≥ 44 px, pruebas en viewport 360 px.

### 9.5 Hosting sugerido

| Opción | Componentes | Cuándo elegirla |
|---|---|---|
| **Vercel + Neon/Supabase** (recomendada) | App en Vercel (deploys por push, preview envs, cron, edge middleware) + Postgres gestionado (Neon o Supabase) con conexión pooled | Mejor DX con Next.js; free tiers generosos para partir |
| **Railway all-in-one** | App + Postgres en el mismo proveedor | Simplicidad operativa, una sola factura, muy buen soporte Docker |
| **Render / Fly.io** | Similar a Railway | Alternativas si hay preferencia o límites de free tier |

Requisitos cubiertos en todas: DB persistente gestionada (backups), variables de entorno seguras para claves de la pasarela, dominio propio con HTTPS.

---

## 10. Riesgos y decisiones abiertas

**Requieren input del cliente antes de codear:**

1. **País y moneda**: se asume Chile y CLP (precios enteros). ¿Confirmado?
2. **Pasarela de pago**: ¿Mercado Pago, Flow o Webpay Plus? (Recomendación: partir con Mercado Pago o Flow por velocidad de integración.)
3. **Entrega**: ¿solo retiro en tienda, solo envíos, o ambos? Si hay envíos: ¿tarifa plana nacional, por región, o integración con courier (Starken, Chilexpress)? ¿Quién despacha?
4. **Boleta/factura electrónica**: en Chile la venta online exige emitir boleta. ¿El negocio ya usa un sistema (SII, LibreDTE, SimpleFactura)? ¿Se integra o el proceso es manual al inicio?
5. **Cuentas de cliente**: ¿compra solo como invitado en v1, o cuentas opcionales desde el inicio?
6. **Menú de la cafetería (landing)**: ¿contenido fijo gestionado por el equipo técnico, o debe ser editable por el cliente (implicaría CRUD adicional)?
7. **Fotos y branding**: ¿existen fotos profesionales del local y productos, logo y paleta de colores? (Bloquea Fase 1.)
8. **Emails transaccionales**: ¿hay dominio propio para el remitente (ej. `pedidos@cafeteria.cl`)? Necesario para Resend en producción.
9. **Stock**: ¿el inventario de la tienda online es independiente del del local físico? ¿Hay un sistema de inventario existente con el que integrarse?
10. **Idiomas**: ¿solo español? (Se asume sí.)
11. **Políticas legales**: términos y condiciones, política de devoluciones y de privacidad (Ley 19.628 de protección de datos en Chile) — ¿quién las redacta?
12. **Volumen esperado**: estimación de pedidos/día para dimensionar hosting y validar que el flujo de stock sin reservas es suficiente.

**Riesgos técnicos principales:**

- *Webhooks en desarrollo local*: requieren túnel (ngrok) para probar la pasarela end-to-end.
- *Certificación de Webpay Plus* (si se elige): agrega 1–2 semanas no triviales.
- *Contenido (fotos/textos)* suele ser el cuello de botella real del lanzamiento, más que el código.

---

## Siguiente paso sugerido

**Comenzar por la Fase 0 + Fase 1: scaffolding del proyecto y landing + catálogo.**

Concretamente, el primer bloque de código debería ser:

1. `create-next-app` con TypeScript + integración de Ant Design (tema base con la paleta de la marca).
2. PostgreSQL local con Docker + Prisma con el schema de la sección 2 y un `seed` con las 4 categorías y 6–10 productos de ejemplo.
3. Layout público + landing completa (es contenido estático: valor visible inmediato y cero riesgo).
4. Catálogo (`/tienda`) y ficha de producto leyendo desde la DB.

**Por qué este orden**: entrega algo visible y demostrable en la primera semana, valida el modelo de datos con datos reales temprano (el error más caro es descubrir en la Fase 3 que el modelo no sirve), y no depende de ninguna decisión externa crítica — mientras se codea, el cliente puede resolver en paralelo las decisiones abiertas 2, 3 y 7 (pasarela, envíos, fotos), que sí bloquean las fases posteriores.
