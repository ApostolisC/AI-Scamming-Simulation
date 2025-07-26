@echo off
REM ScamSimAI - Automated Setup Script (Windows)
REM This script automates the setup process for the ScamSimAI project

setlocal enabledelayedexpansion

echo 🚀 ScamSimAI - Automated Setup
echo ==============================
echo.

REM Get project root directory
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

echo 📋 Step 1: Checking System Requirements
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required but not found. Please install Python 3.11+ and try again.
    echo 💡 Download from: https://www.python.org/downloads/
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python found: !PYTHON_VERSION!
)

REM Check if Python version is 3.x
python -c "import sys; exit(0 if sys.version_info.major == 3 and sys.version_info.minor >= 11 else 1)" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 3.11+ is required. Please update Python and try again.
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not found. Please install Node.js 18+ and try again.
    echo 💡 Download from: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js found: !NODE_VERSION!
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is required but not found. Please install npm and try again.
    pause
    exit /b 1
) else (
    for /f %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm found: !NPM_VERSION!
)

echo.
echo 📋 Step 2: Setting up Python Virtual Environment
echo.

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
    echo ✅ Virtual environment created
) else (
    echo ⚠️ Virtual environment already exists, skipping creation
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment activated

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip >nul 2>&1
echo ✅ pip upgraded

echo.
echo 📋 Step 3: Installing Python Dependencies
echo.

REM Install Python packages from requirements.txt
if exist "requirements.txt" (
    echo Installing dependencies from requirements.txt...
    pip install -r requirements.txt >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies from requirements.txt
        pause
        exit /b 1
    )
    echo ✅ Python dependencies installed from requirements.txt
) else (
    REM Fallback to individual packages
    echo Installing FastAPI and dependencies...
    pip install fastapi uvicorn python-dotenv pydantic >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Failed to install FastAPI dependencies
        pause
        exit /b 1
    )

    echo Installing AI/ML dependencies...
    pip install transformers torch requests >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Failed to install AI/ML dependencies
        pause
        exit /b 1
    )

    echo Installing development dependencies...
    pip install pytest pytest-cov black isort flake8 >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Failed to install development dependencies
        pause
        exit /b 1
    )

    echo ✅ Python dependencies installed
)

echo.
echo 📋 Step 4: Setting up Frontend Dependencies
echo.

cd frontend

REM Install npm packages
echo Installing Node.js dependencies...
npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    cd ..
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed

cd ..

echo.
echo 📋 Step 5: Setting up Environment Files
echo.

REM Server environment file
if not exist "server\.env" (
    echo Creating server\.env file from template...
    copy "server\.env.example" "server\.env" >nul
    echo ✅ Server .env file created
) else (
    echo ⚠️ Server .env file already exists, skipping
)

REM Frontend environment file
if not exist "frontend\.env.local" (
    echo Creating frontend\.env.local file from template...
    copy "frontend\.env.local.example" "frontend\.env.local" >nul
    echo ✅ Frontend .env.local file created
) else (
    echo ⚠️ Frontend .env.local file already exists, skipping
)

echo.
echo 📋 Step 6: Testing Installation
echo.

REM Test server dependencies
echo Testing server dependencies...
cd server
python -c "import fastapi, uvicorn, pydantic; print('✅ Server dependencies OK')" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Server dependencies test failed
) else (
    echo ✅ Server dependencies working
)
cd ..

REM Test frontend dependencies
echo Testing frontend dependencies...
cd frontend
npm run build >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Frontend build test failed (this might be due to missing environment variables)
) else (
    echo ✅ Frontend build test passed
)
cd ..

echo.
echo 📋 Step 7: Setup Complete!
echo.

echo 🎉 Setup completed successfully!
echo.
echo 📋 Next Steps:
echo.
echo 1. Configure API Keys:
echo.
echo    📝 Get your Hugging Face tokens:
echo       • Visit: https://huggingface.co/settings/tokens
echo       • Create a new token with read access
echo       • Copy the token
echo.
echo    📝 Update server\.env file:
echo       • Set HF_TOKEN_PRED=your-huggingface-token
echo       • Set HF_TOKEN_GEN=your-huggingface-token
echo       • Set API_KEY=your-secure-api-key-here
echo.
echo    📝 Update frontend\.env.local file:
echo       • Set NEXT_PUBLIC_API_KEY=your-secure-api-key-here
echo       • (Must match the API_KEY in server\.env)
echo.
echo 2. Start the Application:
echo.
echo    📝 Terminal 1 - Start the server:
echo       cd server
echo       ..\venv\Scripts\activate.bat
echo       python server.py
echo.
echo    📝 Terminal 2 - Start the frontend:
echo       cd frontend
echo       npm run dev
echo.
echo 3. Access the Application:
echo    🌐 Frontend: http://localhost:3000
echo    🔧 API Docs: http://localhost:8000/docs
echo    💚 Health Check: http://localhost:8000/api/health
echo.
echo 4. Development:
echo    📚 Read the documentation:
echo       • README.md - Project overview
echo       • DEVELOPER_GUIDE.md - Development guide
echo       • server\README.md - Server documentation
echo       • frontend\README.md - Frontend documentation
echo.
echo 💡 Tips:
echo    • Always activate the virtual environment: venv\Scripts\activate.bat
echo    • Check the logs if something doesn't work
echo    • Environment variables require server restart to take effect
echo    • Use 'deactivate' to exit the virtual environment
echo.
echo 🚀 Happy coding!
echo.

pause
