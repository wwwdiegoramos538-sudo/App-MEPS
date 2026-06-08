# ==========================================================
# MEPS - Script de configuracion automatica de PostgreSQL
# Ejecutar como Administrador: .\scripts\setup-db.ps1
# ==========================================================

$PG_BIN   = "C:\pgsql\bin"
$PG_DATA  = "C:\Program Files\PostgreSQL\18\data"
$PG_USER  = "postgres"
$PG_PASS  = "meps2026"
$PG_PORT  = "5432"
$DB_NAME  = "meps_db"
$ENV_FILE = "$PSScriptRoot\..\backend\.env"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  MEPS - Configuracion de base de datos" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 1. Verificar binarios
if (-not (Test-Path "$PG_BIN\pg_ctl.exe")) {
    Write-Host "[ERROR] No se encuentran los binarios de PostgreSQL en $PG_BIN" -ForegroundColor Red
    Write-Host "        Extrae el ZIP de binarios a C:\pgsql primero" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Binarios de PostgreSQL encontrados" -ForegroundColor Green

# 2. Agregar al PATH de la sesion
$env:PATH = "$PG_BIN;$env:PATH"
$env:PGPASSWORD = $PG_PASS

# 3. Arrancar PostgreSQL
Write-Host "[INFO] Arrancando PostgreSQL..." -ForegroundColor Yellow
$pgRunning = netstat -ano 2>&1 | Select-String ":5432"
if ($pgRunning) {
    Write-Host "[OK] PostgreSQL ya esta corriendo en puerto 5432" -ForegroundColor Green
} else {
    & "$PG_BIN\pg_ctl.exe" start -D $PG_DATA -l "$PG_DATA\log\startup.log" -w
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] PostgreSQL arrancado correctamente" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] No se pudo arrancar PostgreSQL" -ForegroundColor Red
        Get-Content "$PG_DATA\log\startup.log" -ErrorAction SilentlyContinue | Select-Object -Last 10
        exit 1
    }
}

# 4. Crear base de datos si no existe
Write-Host "[INFO] Creando base de datos $DB_NAME..." -ForegroundColor Yellow
$dbExists = & "$PG_BIN\psql.exe" -U $PG_USER -p $PG_PORT -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" postgres 2>&1
if ($dbExists -eq "1") {
    Write-Host "[OK] Base de datos $DB_NAME ya existe" -ForegroundColor Green
} else {
    & "$PG_BIN\psql.exe" -U $PG_USER -p $PG_PORT -c "CREATE DATABASE $DB_NAME;" postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Base de datos $DB_NAME creada" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] No se pudo crear la base de datos" -ForegroundColor Red
        exit 1
    }
}

# 5. Actualizar .env del backend
Write-Host "[INFO] Actualizando backend/.env..." -ForegroundColor Yellow
$dbUrl = "DATABASE_URL=postgresql://${PG_USER}:${PG_PASS}@localhost:${PG_PORT}/${DB_NAME}?schema=public"
if (Test-Path $ENV_FILE) {
    $content = Get-Content $ENV_FILE
    $content = $content | ForEach-Object {
        if ($_ -match "^DATABASE_URL=") { $dbUrl } else { $_ }
    }
    $content | Set-Content $ENV_FILE -Encoding UTF8
} else {
    Add-Content $ENV_FILE $dbUrl
}
Write-Host "[OK] DATABASE_URL actualizado en .env" -ForegroundColor Green

# 6. Ejecutar Prisma push y seed
Write-Host "[INFO] Ejecutando Prisma db push (crea tablas)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\backend"
node_modules\.bin\prisma db push --accept-data-loss 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Tablas creadas con Prisma" -ForegroundColor Green
} else {
    Write-Host "[WARN] Hubo errores con Prisma db push" -ForegroundColor Yellow
}

Write-Host "[INFO] Ejecutando seed (usuario admin)..." -ForegroundColor Yellow
node prisma/seed.js 2>&1
Write-Host "[OK] Seed completado" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Configuracion completada!" -ForegroundColor Green
Write-Host "  DB: postgresql://postgres:meps2026@localhost:5432/meps_db" -ForegroundColor Cyan
Write-Host "  Admin: admin@meps.com / Admin123!" -ForegroundColor Cyan
Write-Host "  Inicia la app: npm run dev (en App-MEPS/)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
