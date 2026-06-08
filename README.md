# MEPS - Traduciendo el Futuro

Plataforma SaaS profesional para traducir documentos, libros, revistas, manuales y audiolibros a mas de 50 idiomas usando inteligencia artificial (OpenAI + DeepL).

![MEPS Logo](frontend/public/logo.png)

## Stack tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 15, React 19, TailwindCSS, Framer Motion |
| Backend | Node.js, Express |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Archivos | Multer |
| IA | OpenAI API, DeepL API |
| Pagos | Stripe |
| Deploy | Railway (backend), Vercel (frontend) |

## Estructura del proyecto

```
App-MEPS/
├── frontend/                 # Next.js 15 (puerto 3000)
│   ├── public/logo.png       # Logo MEPS
│   └── src/
│       ├── app/              # Paginas (App Router)
│       ├── components/       # UI, iconos con borde negro
│       ├── contexts/         # Auth, Theme (modo oscuro)
│       └── lib/              # API client, utilidades
├── backend/                  # Express API (puerto 4000)
│   ├── prisma/schema.prisma  # Modelo de datos
│   └── src/
│       ├── routes/           # Endpoints REST
│       ├── services/         # IA, Stripe, email
│       └── middleware/       # Auth, upload, seguridad
├── sql/                      # Scripts SQL manuales
│   ├── init.sql
│   └── seed.sql
├── docs/API.md               # Documentacion de APIs
├── package.json              # Scripts monorepo
└── .env.example
```

## Funcionalidades

- Registro e inicio de sesion con JWT
- Recuperacion de contrasena por email
- Dashboard de usuario premium
- Subida de PDF, DOCX, TXT (Multer)
- Traduccion a 50+ idiomas (DeepL + OpenAI)
- Descarga de archivos traducidos
- Historial de traducciones
- Biblioteca personal
- Panel administrador y gestion de usuarios
- Suscripciones (Free, Basic, Pro, Enterprise)
- Pasarela Stripe
- Soporte por chat con IA
- Generador de audiolibros (TTS OpenAI)
- Editor visual de portadas tipo Canva
- Modo oscuro
- Landing page y pantalla de bienvenida futurista
- SEO optimizado

## Requisitos previos

- Node.js 18+
- PostgreSQL 14+
- Cuentas opcionales: OpenAI, DeepL, Stripe, SMTP

## Instalacion rapida

### 1. Clonar e instalar dependencias

```bash
cd App-MEPS
npm install
```

### 2. Configurar variables de entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

Editar `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/meps_db?schema=public
JWT_SECRET=tu-secreto-super-seguro
OPENAI_API_KEY=sk-...
DEEPL_API_KEY=...
```

### 3. Iniciar en desarrollo (PostgreSQL automatico)

Al ejecutar `npm run dev`, la plataforma:
1. Inicia **PostgreSQL embebido** en `backend/data/postgres` (puerto 5432)
2. Crea la base de datos `meps_db` y todas las tablas (Prisma)
3. Crea el usuario administrador por defecto

```bash
npm run dev
```

No necesitas instalar PostgreSQL manualmente para desarrollo.

### Opcion: PostgreSQL instalado en tu PC

Si ya tienes PostgreSQL instalado, configura `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/meps_db?schema=public
```

Luego ejecuta solo:

```bash
npm run db:setup
npm run dev
```

### SQL manual (opcional)

```bash
psql -U postgres -f sql/init.sql
npm run db:push
npm run db:seed --prefix backend
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/api/health

### Credenciales admin por defecto

```
Email: admin@meps.com
Password: Admin123!
```

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm install` | Instala root + backend + frontend |
| `npm run dev` | Inicia backend y frontend simultaneamente |
| `npm run dev:backend` | Solo API Express |
| `npm run dev:frontend` | Solo Next.js |
| `npm run build` | Build de produccion frontend |
| `npm run db:push` | Sincroniza schema Prisma |
| `npm run db:migrate` | Crea migracion Prisma |
| `npm run db:studio` | Abre Prisma Studio |

## Tablas de base de datos

- `users` - Usuarios y autenticacion
- `subscriptions` - Planes de suscripcion
- `documents` - Archivos subidos
- `translations` - Historial de traducciones
- `payments` - Pagos Stripe
- `audiobooks` - Audiolibros generados
- `designs` - Portadas y disenos
- `library_items` - Biblioteca personal
- `chat_messages` - Soporte por chat
- `admin_logs` - Logs de administracion

## Deploy

### Todo en Render (recomendado)

El repo incluye `render.yaml` con PostgreSQL + backend + frontend.

1. Sube el codigo a GitHub (GitLab o Bitbucket).
2. Entra en [Render Dashboard → Blueprints](https://dashboard.render.com/blueprints).
3. **New Blueprint Instance** → conecta tu repositorio.
4. Render detecta `render.yaml` y crea 3 recursos:
   - `meps-db` (PostgreSQL)
   - `meps-backend` (API Express)
   - `meps-frontend` (Next.js)
5. Al crear, te pedira valores secretos (`sync: false`):
   - `ADMIN_PASSWORD` (contrasena del admin)
   - Claves opcionales: OpenAI, DeepL, Stripe, SMTP
6. Espera el deploy (~10-15 min la primera vez).
7. Abre la URL de `meps-frontend` (ej. `https://meps-frontend.onrender.com`).

**Credenciales admin:** `admin@meps.com` + la `ADMIN_PASSWORD` que definiste.

**Stripe webhook:** `https://meps-backend.onrender.com/api/webhooks/stripe`

**Limites plan free:** servicios se duermen tras 15 min sin uso; PostgreSQL free expira a los 30 dias.

### Backend en Railway

1. Crear proyecto en Railway
2. Agregar servicio PostgreSQL
3. Conectar repo, root: `backend/`
4. Variables de entorno desde `.env.example`
5. Deploy automatico con `railway.json`

### Frontend en Vercel

1. Importar proyecto, root: `frontend/`
2. Variables:
   - `NEXT_PUBLIC_API_URL=https://tu-api.railway.app/api`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...`
3. Deploy

### Stripe Webhook

Configurar endpoint: `https://tu-api.railway.app/api/webhooks/stripe`

## Seguridad

- Helmet.js para headers HTTP
- Rate limiting en API
- JWT con expiracion configurable
- Bcrypt (12 rounds) para contrasenas
- Validacion con express-validator
- CORS restringido al frontend
- Proteccion de rutas en frontend
- Archivos limitados a 25MB

## Documentacion API

Ver [docs/API.md](docs/API.md) para referencia completa de endpoints.

## Licencia

Proyecto privado - MEPS 2026
