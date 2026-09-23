# Desplegar MEPS en otra cuenta de Render

Cuenta objetivo: **noenoecruz9@gmail.com**

No se puede subir la app desde aquí sin tu sesión en Render. Sigue estos pasos en el navegador (15–20 min).

## 1. Entrar a Render con la cuenta nueva

1. Cierra sesión en Render si estás en otra cuenta.
2. Abre [https://dashboard.render.com](https://dashboard.render.com).
3. Inicia sesión con **noenoecruz9@gmail.com** (Google o correo).

## 2. Conectar GitHub

1. **Account Settings** → **Connect GitHub** (si aún no está conectado).
2. Autoriza el acceso al repo:  
   `https://github.com/wwwdiegoramos538-sudo/App-MEPS`

Si esa cuenta de GitHub no tiene acceso al repo, haz **Fork** del repo a la cuenta de GitHub de Diego y usa el fork en el paso 3.

## 3. Crear todo con Blueprint (recomendado)

1. Ve a [https://dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2. **New Blueprint Instance**.
3. Elige el repo **App-MEPS** (rama `master`).
4. Render leerá `render.yaml` y creará:
   - Base de datos **meps-db** (PostgreSQL free)
   - **meps-backend** (API)
   - **meps-frontend** (Next.js)
5. Pulsa **Apply**.

## 4. Variables obligatorias en el dashboard

Cuando Render pida valores **sync: false**, configura al menos:

| Servicio | Variable | Valor sugerido |
|----------|----------|----------------|
| meps-backend | `ADMIN_PASSWORD` | `Admin123!` (o la que quieras) |
| meps-backend | `ADMIN_EMAIL` | `admin@meps.com` (ya viene en yaml) |

Las demás (OpenAI, Stripe, SMTP) pueden quedar vacías; la app funciona en modo demo con `OPEN_LOGIN=true`.

## 5. Esperar el deploy

- Primer deploy: **10–15 minutos** (build de Next + Prisma).
- En **meps-backend** y **meps-frontend** debe decir **Live** en verde.

## 6. URLs de tu app

En el dashboard, abre **meps-frontend** → copia **URL** (ejemplo):

`https://meps-frontend-xxxx.onrender.com`

- **App / login:** `https://TU-URL.onrender.com/login`
- **API:** la URL de **meps-backend** (solo si la necesitas directo)

## 7. Probar login y guía

1. Abre la URL del frontend en el celular o PC.
2. Espera **30–60 s** si el plan free estaba dormido.
3. Login admin:
   - Email: `admin@meps.com`
   - Contraseña: la que pusiste en `ADMIN_PASSWORD` (ej. `Admin123!`)
4. También puedes usar **cualquier email + cualquier contraseña** (`OPEN_LOGIN=true`).
5. Tras entrar, debe aparecer la **guía** (Paso 1 de 11). Si no, pulsa **Guía** arriba en el dashboard.

## 8. Límite del plan free

- Solo **un** Postgres free por cuenta (esta cuenta nueva está bien si no tienes otro).
- Los servicios **duermen** tras ~15 min sin uso; la primera carga tarda.
- Postgres free expira a los 30 días si no renuevas (Render avisa por correo).

## 9. Monitor local (opcional)

Cuando tengas las URLs nuevas:

```bash
set FRONTEND_URL=https://TU-FRONTEND.onrender.com
set BACKEND_URL=https://TU-BACKEND.onrender.com
npm run monitor:render
```

## Problemas frecuentes

| Problema | Qué hacer |
|----------|-----------|
| Build falla en frontend | Revisa logs; suele ser Node 20 (ya definido en yaml). |
| Login 503 | Espera a que **meps-backend** esté Live; reintenta en 1 min. |
| Guía no sale | Ctrl+F5; entra de nuevo; botón **Guía** en el dashboard. |
| CORS | `FRONTEND_URL` en backend se llena sola desde el blueprint. |

---

**Importante:** La app en la cuenta Render antigua seguirá existiendo hasta que la borres allí. Esta guía crea una **copia nueva** en **noenoecruz9@gmail.com**.
