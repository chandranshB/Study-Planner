@echo off
setlocal enabledelayedexpansion

TITLE AI Study App Launcher
COLOR 0A

:: --- Configuration ---
set "VENV_NAME=venv"
set "REQUIREMENTS=flask flask-sqlalchemy ollama pypdf"
set "PORT=5000"

echo ========================================================
echo       AI Study Manager - Auto Installer & Launcher
echo ========================================================
echo.

:: 1. Check for Python
echo [CHECK] Looking for Python...
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Python is not detected! 
    echo Please install Python from https://www.python.org/
    echo Important: Check "Add Python to PATH" during installation.
    pause
    exit /b
)

:: 2. Check for app.py
IF NOT EXIST "app.py" (
    COLOR 0C
    echo [ERROR] app.py not found!
    echo Please make sure this file is in the same folder as app.py.
    pause
    exit /b
)

:: 3. Setup Virtual Environment
if not exist "%VENV_NAME%" (
    echo [SETUP] Creating virtual environment '%VENV_NAME%'...
    python -m venv %VENV_NAME%
) else (
    echo [CHECK] Virtual environment found.
)

:: 4. Activate Venv
echo [SETUP] Activating virtual environment...
call %VENV_NAME%\Scripts\activate.bat

:: 5. Install Dependencies
echo [SETUP] Installing/Updating libraries (this may take a moment)...
pip install %REQUIREMENTS% >nul

:: 6. Check if Server is Running
netstat -ano | findstr :%PORT% | findstr LISTENING >nul
IF %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Server is already running!
    echo [ACTION] Opening App in Browser...
    start http://127.0.0.1:%PORT%
    
    echo.
    echo You can close this launcher window.
    pause
    exit /b
)

:: 7. Start Server
echo.
echo [SUCCESS] Setup complete.
echo [NOTE] Make sure Ollama is running for AI features!
echo [ACTION] Starting Server & Opening Browser...
start http://127.0.0.1:%PORT%

echo.
echo [LOGS] Server Output (Keep this window open):
echo --------------------------------------------------------
python app.py