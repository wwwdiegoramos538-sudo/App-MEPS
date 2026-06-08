# MEPS - Crear base de datos y tablas (ejecutar despues de instalar PostgreSQL)
$ErrorActionPreference = "Stop"

$PG_BIN = @(
    "C:\Program Files\PostgreSQL\17\bin",
    "C:\Program Files\PostgreSQL\18\bin",
    "C:\pgsql\bin"
) | Where-Object { Test-Path "$_\psql.exe" } | Select-Object -First 1

if (-not $PG_BIN) {
    Write-Host "[ERROR] No se encontro psql.exe. Instala PostgreSQL primero." -ForegroundColor Red
    exit 1
}

$env:PATH = "$PG_BIN;$env:PATH"
$env:PGPASSWORD = "meps2026"

Write-Host "Usando: $PG_BIN" -ForegroundColor Cyan

# Esperar a que PostgreSQL responda
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    $test = & "$PG_BIN\psql.exe" -U postgres -p 5432 -tAc "SELECT 1" postgres 2>&1
    if ($test -eq "1") { $ready = $true; break }
    Write-Host "Esperando PostgreSQL... ($i/30)"
    Start-Sleep -Seconds 2
}

if (-not $ready) {
    Write-Host "[ERROR] PostgreSQL no responde en puerto 5432" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] PostgreSQL activo" -ForegroundColor Green

$dbExists = & "$PG_BIN\psql.exe" -U postgres -p 5432 -tAc "SELECT 1 FROM pg_database WHERE datname='meps_db'" postgres
if ($dbExists -ne "1") {
    & "$PG_BIN\psql.exe" -U postgres -p 5432 -c "CREATE DATABASE meps_db;" postgres
    Write-Host "[OK] Base de datos meps_db creada" -ForegroundColor Green
} else {
    Write-Host "[OK] Base de datos meps_db ya existe" -ForegroundColor Green
}

Set-Location "$PSScriptRoot\..\backend"
Write-Host "Ejecutando Prisma db push..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss
Write-Host "Ejecutando seed..." -ForegroundColor Yellow
node prisma/seed.js

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Base de datos MEPS lista!" -ForegroundColor Green
Write-Host "  URL: postgresql://postgres:meps2026@localhost:5432/meps_db" -ForegroundColor Cyan
Write-Host "  Admin: admin@meps.com / Admin123!" -ForegroundColor Cyan
Write-Host "  Ejecuta: npm run dev" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Green
