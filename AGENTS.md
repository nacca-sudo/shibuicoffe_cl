<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Shibui Café — contexto del proyecto

Ecommerce para cafetería (Next.js App Router). Fases 0 y 1 completadas: setup, landing y catálogo con ficha. Pendiente: carrito (Fase 2), pagos (Fase 3), auth/admin (Fase 4), endurecimiento (Fase 5). Ver `plan-ecommerce-cafeteria.md` en la raíz.

Landing: el menú de la cafetería es un **PDF descargable** (`public/menu-shibui.pdf`, placeholder regenerable con `node scripts/generate-menu-pdf.mjs`), no se renderiza en página. La sección **Eventos** (`/#eventos`) usa antd Calendar con datos estáticos en `src/lib/data/eventos.ts`. Locale antd en español: `esES` + `dayjs.locale("es")` en el root layout.

## Stack y comandos

- Next.js 16 (Turbopack) + TypeScript strict + ESLint. **Sin Tailwind**: estilos con Ant Design 6 + `src/app/globals.css`.
- Ant Design con tema de marca en `src/app/layout.tsx` (ConfigProvider: primario `#495057`, fondo `#F8F9FA`, texto `#212529`).
- Prisma **6** (fijado a propósito: Prisma 7 exige driver adapters, dependencias fuera del alcance aprobado). Seed: `package.json#prisma.seed`.
- PostgreSQL 16 en Docker (`docker compose up -d`), **puerto host 5433** (el 5432 está ocupado por otro proyecto en esta máquina).

```bash
docker compose up -d          # DB local
npx prisma migrate dev        # migraciones
npx prisma db seed            # catálogo de ejemplo (idempotente)
npm run dev / build / start / lint
```

## Convenciones

- Precios CLP como `Int` (sin decimales). Formato: `formatCLP()` en `src/lib/utils.ts`.
- Cliente Prisma singleton en `src/lib/db.ts`. Las páginas que consultan la DB usan `export const dynamic = "force-dynamic"` (así `next build` no exige DB viva, importante para CI).
- **antd en Server Components**: solo exports directos (`Button`, `Card`, `Tag`…). Los compuestos (`Card.Meta`, `Typography.Title`, `Badge.Ribbon`) llegan como `undefined` en RSC — usarlos solo dentro de componentes `"use client"` o reemplazar por HTML plano.
- Imágenes: placeholders SVG en `public/img/` con `next/image` + `unoptimized`. Marcar con `// TODO(fase-5)` donde deban ir fotos reales.
- Copy en español. Route groups: `(landing)` público/estático, `(shop)` dinámico. No crear `admin/`, `api/`, `actions/` ni auth hasta sus fases.
