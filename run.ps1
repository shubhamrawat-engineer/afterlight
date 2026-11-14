# ====================================================================
# AFTERLIGHT Backend Launcher for Windows (PowerShell)
# ====================================================================

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  AFTERLIGHT API Backend - Windows PowerShell Launcher" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Virtual environment setup
if (-not (Test-Path -Path ".venv")) {
    Write-Host "[*] Creating virtual environment (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
}

# 2. Activate Virtual Environment
$venvActivate = ".venv\Scripts\Activate.ps1"
if (Test-Path -Path $venvActivate) {
    Write-Host "[*] Activating virtual environment..." -ForegroundColor Green
    & $venvActivate
}

# 3. Check & Install Dependencies
Write-Host "[*] Verifying dependencies..." -ForegroundColor Yellow
python -c "import fastapi, uvicorn, pydantic, httpx" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[*] Installing dependencies from requirements.txt..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# 4. Launch Server
Write-Host "[*] Launching AFTERLIGHT backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
