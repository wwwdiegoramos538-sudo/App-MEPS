# Checklist — MEPS en Render (cuenta vacía)

**Correo Render:** noenoecruz9@gmail.com  
**Repo:** https://github.com/wwwdiegoramos538-sudo/App-MEPS (rama `master`)

Yo (Cursor) **no puedo** iniciar sesión en tu Render. Tú haces estos pasos **una sola vez** (~15 min):

---

- [ ] 1. Abre ventana de incógnito → https://dashboard.render.com  
- [ ] 2. Inicia sesión con **noenoecruz9@gmail.com** (no uses la otra cuenta).  
- [ ] 3. **Account Settings** → conecta **GitHub** (cuenta que tenga acceso al repo App-MEPS).  
- [ ] 4. https://dashboard.render.com/blueprints → **New Blueprint Instance**  
- [ ] 5. Elige repo **App-MEPS** → rama **master** → **Apply**  
- [ ] 6. Cuando pida secretos, en **meps-backend** pon **`ADMIN_PASSWORD`** = `Admin123!`  
- [ ] 7. Espera **Live** en verde: `meps-db`, `meps-backend`, `meps-frontend`  
- [ ] 8. Copia la URL de **meps-frontend** (será distinta a `meps-frontend.onrender.com` de la cuenta vieja)

---

## Después del deploy

| Qué | Dónde |
|-----|--------|
| App | `https://TU-URL-FRONTEND.onrender.com` |
| Login | `https://TU-URL-FRONTEND.onrender.com/login` |
| Admin | `admin@meps.com` / `Admin123!` (o tu `ADMIN_PASSWORD`) |
| Guía | Sale sola al entrar; si no, botón **Guía** |

**Login abierto:** cualquier email + cualquier contraseña también funciona.

---

## Importante

- La app en la **cuenta Render antigua** sigue existiendo hasta que la borres allí.  
- En **noenoecruz9** tendrás **URLs nuevas**; usa solo esas.  
- Plan free: primera visita puede tardar **30–60 s** (servidor despertando).

Cuando tengas la URL nueva, pégala en el chat para verificar login y guía.
