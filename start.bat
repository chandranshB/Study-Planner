@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    StudyFlow - Setup and Launch
echo ========================================
echo.

REM Check if Python is installed
echo [1/6] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)
echo Python found!
echo.

REM Check if Node.js is installed
echo [2/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
echo.

REM Create virtual environment if it doesn't exist
echo [3/6] Setting up Python virtual environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created!
) else (
    echo Virtual environment already exists!
)
echo.

REM Activate virtual environment and install Python dependencies
echo [4/6] Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo Python dependencies installed!
echo.

REM Install Node.js dependencies
echo [5/6] Installing Node.js dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install npm packages
        pause
        exit /b 1
    )
    echo Node.js dependencies installed!
) else (
    echo Node.js dependencies already installed!
)
echo.

REM Check if Ollama is installed
echo [6/6] Checking Ollama...
where ollama >nul 2>&1
if errorlevel 1 (
    echo WARNING: Ollama not found in PATH
    echo Please install Ollama from https://ollama.ai/download
    echo The application will start but AI features may not work
    echo.
    set OLLAMA_AVAILABLE=0
) else (
    echo Ollama found!
    set OLLAMA_AVAILABLE=1
)
echo.

echo ========================================
echo    Starting Services
echo ========================================
echo.

REM Start Ollama serve in background if available
if !OLLAMA_AVAILABLE! equ 1 (
    echo Starting Ollama server...
    start "Ollama Server" cmd /c "ollama serve"
    timeout /t 3 /nobreak >nul
    echo Ollama server started!
    echo.
)

REM Start Python Flask backend
echo Starting Python backend server...
start "Flask Backend" cmd /k "call venv\Scripts\activate.bat && python app.py"
timeout /t 3 /nobreak >nul
echo Backend server starting on http://localhost:5000
echo.

REM Start React frontend
echo Starting React frontend...
start "React Frontend" cmd /k "npm start"
echo Frontend starting on http://localhost:3000
echo.

echo ========================================
echo    All Services Started!
echo ========================================
echo.
echo Services running:
if !OLLAMA_AVAILABLE! equ 1 (
    echo   - Ollama Server: http://localhost:11434
)
echo   - Backend API: http://localhost:5000
echo   - Frontend: http://localhost:3000
echo.
echo The application will open in your browser shortly.
echo.
echo To stop all services, close all command windows.
echo.
echo Press any key to exit this window...
pause >nul
