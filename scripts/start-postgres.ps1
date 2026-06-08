# ==========================================================
# MEPS - Arrancar PostgreSQL manualmente
# Ejecutar: .\scripts\start-postgres.ps1
# ==========================================================

$PG_BIN  = "C:\pgsql\bin"
$PG_DATA = "C:\Program Files\PostgreSQL\18\data"

if (-not (Test-Path "$PG_BIN\pg_ctl.exe")) {
    Write-Host "[ERROR] Binarios no encontrados en $PG_BIN" -ForegroundColor Red
    exit 1
}

$env:PATH = "$PG_BIN;$env:PATH"

$running = netstat -ano 2>&1 | Select-String ":5432"
if ($running) {
    Write-Host "[OK] PostgreSQL ya esta corriendo" -ForegroundColor Green
} else {
    Write-Host "Arrancando PostgreSQL..." -ForegroundColor Yellow
    & "$PG_BIN\pg_ctl.exe" start -D $PG_DATA -w
}
