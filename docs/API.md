# MEPS API Documentation

Base URL: `http://localhost:4000/api` (development)

## Authentication

All protected endpoints require header:
```
Authorization: Bearer <jwt_token>
```

### POST /auth/register
```json
{ "email": "user@example.com", "password": "password123", "name": "Usuario" }
```

### POST /auth/login
```json
{ "email": "user@example.com", "password": "password123" }
```

### POST /auth/forgot-password
```json
{ "email": "user@example.com" }
```

### POST /auth/reset-password
```json
{ "token": "reset-token", "password": "newpassword123" }
```

## Translations

### GET /translations/languages
Returns 50+ supported languages.

### POST /translations
Multipart form:
- `file`: PDF, DOCX, or TXT (max 25MB)
- `targetLanguage`: required (e.g. `en`)
- `sourceLanguage`: optional (default `auto`)
- `provider`: `auto` | `deepl` | `openai`

### GET /translations/:id/download
Download translated file.

## Documents

### POST /documents/upload
Multipart: `file`, optional `title`

### GET /documents
List user documents.

## Subscriptions

### GET /subscriptions/plans
List available plans.

### POST /subscriptions/checkout
```json
{ "plan": "basic" }
```
Returns Stripe checkout URL.

## Audiobooks

### POST /audiobooks
```json
{
  "title": "Mi audiolibro",
  "sourceText": "Texto a convertir...",
  "language": "es",
  "voice": "alloy"
}
```

## Admin (requires ADMIN role)

### GET /admin/dashboard
Platform statistics.

### GET /admin/users?search=email
List users.

### PUT /admin/users/:id
```json
{ "isActive": false, "role": "USER", "plan": "PRO" }
```
