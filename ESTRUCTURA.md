# Estructura completa del proyecto MEPS

```
App-MEPS/
│
├── package.json                 # Monorepo: npm run dev, install, db:*
├── package-lock.json
├── .env.example                 # Variables globales de referencia
├── .gitignore
├── README.md                    # Documentacion principal
├── ESTRUCTURA.md                # Este archivo
│
├── docs/
│   └── API.md                   # Documentacion REST API
│
├── sql/
│   ├── init.sql                 # Creacion manual de BD PostgreSQL
│   └── seed.sql                 # Datos iniciales
│
├── backend/                     # API Express (puerto 4000)
│   ├── package.json
│   ├── .env.example
│   ├── .env                     # (local, no commitear)
│   ├── railway.json             # Config deploy Railway
│   │
│   ├── prisma/
│   │   ├── schema.prisma        # Modelo: users, translations, documents...
│   │   └── seed.js              # Admin por defecto
│   │
│   ├── uploads/                 # Archivos subidos temporales
│   ├── storage/                 # Almacenamiento traducciones/audiobooks
│   │
│   └── src/
│       ├── index.js             # Entry point Express
│       ├── config/
│       │   ├── index.js         # Variables de entorno
│       │   └── database.js      # Prisma client
│       ├── middleware/
│       │   ├── auth.js          # JWT + admin guard
│       │   ├── upload.js        # Multer PDF/DOCX/TXT
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── auth.js          # register, login, reset password
│       │   ├── users.js         # perfil, stats, password
│       │   ├── documents.js     # upload, list, delete
│       │   ├── translations.js  # traducir, descargar, idiomas
│       │   ├── library.js       # biblioteca personal
│       │   ├── subscriptions.js # planes, Stripe checkout
│       │   ├── payments.js      # historial pagos
│       │   ├── audiobooks.js    # TTS OpenAI
│       │   ├── designs.js       # editor portadas
│       │   ├── chat.js          # soporte IA
│       │   └── admin.js         # panel administrador
│       ├── services/
│       │   ├── translationService.js
│       │   ├── openaiService.js
│       │   ├── deeplService.js
│       │   ├── stripeService.js
│       │   ├── storageService.js
│       │   ├── fileParserService.js
│       │   └── emailService.js
│       └── utils/
│           └── languages.js     # 50+ idiomas
│
└── frontend/                    # Next.js 15 (puerto 3000)
    ├── package.json
    ├── .env.example
    ├── .env.local               # (local)
    ├── vercel.json              # Config deploy Vercel
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    │
    ├── public/
    │   └── logo.png             # Logo MEPS oficial
    │
    └── src/
        ├── app/
        │   ├── layout.tsx       # Root + SEO metadata
        │   ├── page.tsx         # Landing page premium
        │   ├── globals.css
        │   ├── providers.tsx
        │   ├── robots.ts        # SEO
        │   ├── sitemap.ts       # SEO
        │   ├── welcome/         # Pantalla bienvenida futurista
        │   ├── login/
        │   ├── register/
        │   ├── forgot-password/
        │   ├── reset-password/
        │   ├── dashboard/       # Area protegida usuario
        │   │   ├── layout.tsx
        │   │   ├── page.tsx     # Dashboard principal
        │   │   ├── translate/   # Subir y traducir
        │   │   ├── documents/
        │   │   ├── history/
        │   │   ├── library/
        │   │   ├── audiobooks/
        │   │   ├── designs/     # Editor portadas Canva
        │   │   ├── subscription/
        │   │   ├── support/     # Chat IA
        │   │   └── settings/
        │   └── admin/           # Panel administrador
        │       ├── layout.tsx
        │       ├── page.tsx
        │       └── users/
        ├── components/
        │   ├── Logo.tsx
        │   ├── icons/
        │   │   └── OutlineIcon.tsx  # Iconos borde negro
        │   ├── ui/
        │   │   ├── Button.tsx
        │   │   ├── Input.tsx
        │   │   └── Card.tsx
        │   ├── layout/
        │   │   ├── Navbar.tsx
        │   │   ├── Sidebar.tsx
        │   │   └── MobileNav.tsx
        │   └── auth/
        │       └── ProtectedRoute.tsx
        ├── contexts/
        │   ├── AuthContext.tsx
        │   └── ThemeContext.tsx   # Modo oscuro
        └── lib/
            ├── api.ts           # Cliente Axios
            ├── auth.ts          # Token localStorage
            └── utils.ts
```

## Flujo de datos

```
Usuario → Next.js (3000) → Express API (4000) → PostgreSQL
                              ↓
                    OpenAI / DeepL / Stripe
```

## Comandos esenciales

```bash
npm install          # Instala todo
npm run db:push      # Crea tablas en PostgreSQL
npm run db:seed --prefix backend   # Crea admin
npm run dev          # Frontend + Backend
```
