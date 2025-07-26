# ScamSimAI - Automated Setup Script (PowerShell)
# This script automates the setup process for the ScamSimAI project

param(
    [switch]$SkipPrompts = $false
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Step($step, $message) {
    Write-Host "📋 Step $step`: $message" -ForegroundColor Blue
    Write-Host ""
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor Green
    Write-Host ""
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
    Write-Host ""
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
    Write-Host ""
}

function Write-Info($message) {
    Write-Host "💡 $message" -ForegroundColor Cyan
    Write-Host ""
}

# Function to check if command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Get project root directory
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot

Write-Host "🚀 ScamSimAI - Automated Setup" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta
Write-Host ""

Write-Step "1" "Checking System Requirements"

# Check Python
if (Test-Command "python") {
    try {
        $pythonVersion = & python --version 2>&1
        if ($pythonVersion -match "Python 3\.(\d+)") {
            $minorVersion = [int]$matches[1]
            if ($minorVersion -ge 11) {
                Write-Success "Python found: $pythonVersion"
                $pythonCmd = "python"
            } else {
                Write-Error "Python 3.11+ is required. Found: $pythonVersion"
                Write-Info "Please install Python 3.11+ from: https://www.python.org/downloads/"
                exit 1
            }
        } else {
            Write-Error "Unable to determine Python version: $pythonVersion"
            exit 1
        }
    }
    catch {
        Write-Error "Error checking Python version: $_"
        exit 1
    }
} else {
    Write-Error "Python is required but not found. Please install Python 3.11+ and try again."
    Write-Info "Download from: https://www.python.org/downloads/"
    exit 1
}

# Check Node.js
if (Test-Command "node") {
    try {
        $nodeVersion = & node --version 2>&1
        Write-Success "Node.js found: $nodeVersion"
    }
    catch {
        Write-Error "Error checking Node.js version: $_"
        exit 1
    }
} else {
    Write-Error "Node.js 18+ is required but not found. Please install Node.js and try again."
    Write-Info "Download from: https://nodejs.org/"
    exit 1
}

# Check npm
if (Test-Command "npm") {
    try {
        $npmVersion = & npm --version 2>&1
        Write-Success "npm found: $npmVersion"
    }
    catch {
        Write-Error "Error checking npm version: $_"
        exit 1
    }
} else {
    Write-Error "npm is required but not found. Please install npm and try again."
    exit 1
}

Write-Step "2" "Setting up Python Virtual Environment"

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..."
    try {
        & $pythonCmd -m venv venv
        Write-Success "Virtual environment created"
    }
    catch {
        Write-Error "Failed to create virtual environment: $_"
        exit 1
    }
} else {
    Write-Warning "Virtual environment already exists, skipping creation"
}

# Activate virtual environment
Write-Host "Activating virtual environment..."
try {
    & "venv\Scripts\Activate.ps1"
    Write-Success "Virtual environment activated"
}
catch {
    Write-Warning "PowerShell execution policy might prevent activation. Trying alternative method..."
    try {
        cmd /c "venv\Scripts\activate.bat && python -m pip --version"
        Write-Success "Virtual environment activation verified"
    }
    catch {
        Write-Error "Failed to activate virtual environment: $_"
        Write-Info "You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
        exit 1
    }
}

# Upgrade pip
Write-Host "Upgrading pip..."
try {
    & python -m pip install --upgrade pip --quiet
    Write-Success "pip upgraded"
}
catch {
    Write-Warning "pip upgrade failed, continuing anyway: $_"
}

Write-Step "3" "Installing Python Dependencies"

# Install Python packages from requirements.txt
if (Test-Path "requirements.txt") {
    Write-Host "Installing dependencies from requirements.txt..."
    try {
        & pip install -r requirements.txt --quiet
        Write-Success "Python dependencies installed from requirements.txt"
    }
    catch {
        Write-Error "Failed to install dependencies from requirements.txt: $_"
        Write-Info "Try running the commands manually in the activated virtual environment"
        exit 1
    }
} else {
    # Fallback to individual packages
    Write-Host "Installing FastAPI and dependencies..."
    try {
        & pip install fastapi uvicorn python-dotenv pydantic --quiet
        Write-Host "Installing AI/ML dependencies..."
        & pip install transformers torch requests --quiet
        Write-Host "Installing development dependencies..."
        & pip install pytest pytest-cov black isort flake8 --quiet
        Write-Success "Python dependencies installed"
    }
    catch {
        Write-Error "Failed to install Python dependencies: $_"
        Write-Info "Try running the commands manually in the activated virtual environment"
        exit 1
    }
}

Write-Step "4" "Setting up Frontend Dependencies"

try {
    Set-Location "frontend"
    Write-Host "Installing Node.js dependencies..."
    & npm install --silent
    Write-Success "Frontend dependencies installed"
    Set-Location ".."
}
catch {
    Write-Error "Failed to install frontend dependencies: $_"
    Set-Location ".."
    exit 1
}

Write-Step "5" "Setting up Environment Files"

# Server environment file
if (-not (Test-Path "server\.env")) {
    Write-Host "Creating server\.env file from template..."
    Copy-Item "server\.env.example" "server\.env"
    Write-Success "Server .env file created"
} else {
    Write-Warning "Server .env file already exists, skipping"
}

# Frontend environment file
if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "Creating frontend\.env.local file from template..."
    Copy-Item "frontend\.env.local.example" "frontend\.env.local"
    Write-Success "Frontend .env.local file created"
} else {
    Write-Warning "Frontend .env.local file already exists, skipping"
}

Write-Step "6" "Testing Installation"

# Test server dependencies
Write-Host "Testing server dependencies..."
try {
    Set-Location "server"
    $testResult = & python -c "import fastapi, uvicorn, pydantic; print('Server dependencies OK')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Server dependencies working"
    } else {
        Write-Warning "Server dependencies test failed: $testResult"
    }
    Set-Location ".."
}
catch {
    Write-Warning "Server dependencies test failed: $_"
    Set-Location ".."
}

# Test frontend dependencies
Write-Host "Testing frontend dependencies..."
try {
    Set-Location "frontend"
    $buildResult = & npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend build test passed"
    } else {
        Write-Warning "Frontend build test failed (this might be due to missing environment variables)"
    }
    Set-Location ".."
}
catch {
    Write-Warning "Frontend build test failed: $_"
    Set-Location ".."
}

Write-Step "7" "Setup Complete!"

Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure API Keys:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   📝 Get your Hugging Face tokens:"
Write-Host "      • Visit: https://huggingface.co/settings/tokens"
Write-Host "      • Create a new token with read access"
Write-Host "      • Copy the token"
Write-Host ""
Write-Host "   📝 Update server\.env file:"
Write-Host "      • Set HF_TOKEN_PRED=your-huggingface-token"
Write-Host "      • Set HF_TOKEN_GEN=your-huggingface-token"
Write-Host "      • Set API_KEY=your-secure-api-key-here"
Write-Host ""
Write-Host "   📝 Update frontend\.env.local file:"
Write-Host "      • Set NEXT_PUBLIC_API_KEY=your-secure-api-key-here"
Write-Host "      • (Must match the API_KEY in server\.env)"
Write-Host ""
Write-Host "2. Start the Application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   📝 Terminal 1 - Start the server:"
Write-Host "      cd server"
Write-Host "      ..\venv\Scripts\Activate.ps1  # Activate virtual environment"
Write-Host "      python server.py"
Write-Host ""
Write-Host "   📝 Terminal 2 - Start the frontend:"
Write-Host "      cd frontend"
Write-Host "      npm run dev"
Write-Host ""
Write-Host "3. Access the Application:" -ForegroundColor Yellow
Write-Host "   🌐 Frontend: http://localhost:3000"
Write-Host "   🔧 API Docs: http://localhost:8000/docs"
Write-Host "   💚 Health Check: http://localhost:8000/api/health"
Write-Host ""
Write-Host "4. Development:" -ForegroundColor Yellow
Write-Host "   📚 Read the documentation:"
Write-Host "      • README.md - Project overview"
Write-Host "      • DEVELOPER_GUIDE.md - Development guide"
Write-Host "      • server\README.md - Server documentation"
Write-Host "      • frontend\README.md - Frontend documentation"
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   • Always activate the virtual environment: venv\Scripts\Activate.ps1"
Write-Host "   • If you get execution policy errors, run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
Write-Host "   • Check the logs if something doesn't work"
Write-Host "   • Environment variables require server restart to take effect"
Write-Host "   • Use 'deactivate' to exit the virtual environment"
Write-Host ""
Write-Host "🚀 Happy coding!" -ForegroundColor Green

if (-not $SkipPrompts) {
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
