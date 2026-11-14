@echo off
REM ====================================================================
REM AFTERLIGHT Backend Launcher for Windows (Command Prompt)
REM ====================================================================
setlocal enabledelayedexpansion

echo ====================================================================
echo  AFTERLIGHT API Backend - Windows Startup Script
echo ====================================================================

REM 1. Check Python
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python was not found in your PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

REM 2. Setup Virtual Environment (.venv)
if not exist ".venv" (
    echo [*] Creating virtual environment (.venv)...
    python -m venv .venv
)

REM 3. Activate Virtual Environment
if exist ".venv\Scripts\activate.bat" (
    echo [*] Activating virtual environment...
    call .venv\Scripts\activate.bat
)

REM 4. Check dependencies
echo [*] Checking dependencies...
python -c "import fastapi, uvicorn, pydantic, httpx" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [*] Installing dependencies from requirements.txt...
    pip install -r requirements.txt
)

REM 5. Run Server
echo [*] Starting FastAPI server on http://127.0.0.1:8000 ...
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
