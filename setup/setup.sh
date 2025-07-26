#!/bin/bash

#!/bin/bash
# ScamSimAI - Automated Setup Script (Unix/Linux/macOS)
# This script automates the setup process for the ScamSimAI project

set -e  # Exit on any error

echo "🚀 ScamSimAI - Automated Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    echo ""
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    echo ""
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    echo ""
}

print_info() {
    echo -e "${YELLOW}💡 $1${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

print_step "1" "Checking System Requirements"

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_success "Python 3 found: $PYTHON_VERSION"
    PYTHON_CMD="python3"
elif command_exists python; then
    PYTHON_VERSION=$(python --version | cut -d' ' -f2)
    if [[ $PYTHON_VERSION == 3.* ]]; then
        print_success "Python 3 found: $PYTHON_VERSION"
        PYTHON_CMD="python"
    else
        print_error "Python 3.11+ is required. Found Python $PYTHON_VERSION"
        exit 1
    fi
else
    print_error "Python 3.11+ is required but not found. Please install Python 3.11+ and try again."
    exit 1
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js 18+ is required but not found. Please install Node.js 18+ and try again."
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm is required but not found. Please install npm and try again."
    exit 1
fi

print_step "2" "Setting up Python Virtual Environment"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
    print_success "Virtual environment created"
else
    print_warning "Virtual environment already exists, skipping creation"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
print_success "Virtual environment activated"

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip
print_success "pip upgraded"

print_step "3" "Installing Python Dependencies"

# Install Python packages from requirements.txt
if [ -f "requirements.txt" ]; then
    echo "Installing dependencies from requirements.txt..."
    pip install -r requirements.txt
    print_success "Python dependencies installed from requirements.txt"
else
    # Fallback to individual packages
    echo "Installing FastAPI and dependencies..."
    pip install fastapi uvicorn python-dotenv pydantic

    echo "Installing AI/ML dependencies..."
    pip install transformers torch requests

    echo "Installing development dependencies..."
    pip install pytest pytest-cov black isort flake8

    print_success "Python dependencies installed"
fi

print_step "4" "Setting up Frontend Dependencies"

cd frontend

# Install npm packages
echo "Installing Node.js dependencies..."
npm install

print_success "Frontend dependencies installed"

cd ..

print_step "5" "Setting up Environment Files"

# Server environment file
if [ ! -f "server/.env" ]; then
    echo "Creating server/.env file from template..."
    cp server/.env.example server/.env
    print_success "Server .env file created"
else
    print_warning "Server .env file already exists, skipping"
fi

# Frontend environment file
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local file from template..."
    cp frontend/.env.local.example frontend/.env.local
    print_success "Frontend .env.local file created"
else
    print_warning "Frontend .env.local file already exists, skipping"
fi

print_step "6" "Testing Installation"

# Test server dependencies
echo "Testing server dependencies..."
cd server
if $PYTHON_CMD -c "import fastapi, uvicorn, pydantic; print('✅ Server dependencies OK')" 2>/dev/null; then
    print_success "Server dependencies working"
else
    print_error "Server dependencies test failed"
fi
cd ..

# Test frontend dependencies
echo "Testing frontend dependencies..."
cd frontend
if npm run build --silent >/dev/null 2>&1; then
    print_success "Frontend build test passed"
else
    print_warning "Frontend build test failed (this might be due to missing environment variables)"
fi
cd ..

print_step "7" "Setup Complete!"

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo "📋 Next Steps:"
echo ""
echo -e "${YELLOW}1. Configure API Keys:${NC}"
echo "   📝 Get your Hugging Face tokens:"
echo "      • Visit: https://huggingface.co/settings/tokens"
echo "      • Create a new token with read access"
echo "      • Copy the token"
echo ""
echo "   📝 Update server/.env file:"
echo "      • Set HF_TOKEN_PRED=your-huggingface-token"
echo "      • Set HF_TOKEN_GEN=your-huggingface-token"
echo "      • Set API_KEY=your-secure-api-key-here"
echo ""
echo "   📝 Update frontend/.env.local file:"
echo "      • Set NEXT_PUBLIC_API_KEY=your-secure-api-key-here"
echo "      • (Must match the API_KEY in server/.env)"
echo ""
echo -e "${YELLOW}2. Start the Application:${NC}"
echo ""
echo "   📝 Terminal 1 - Start the server:"
echo "      cd server"
echo "      source ../venv/bin/activate  # Activate virtual environment"
echo "      python server.py"
echo ""
echo "   📝 Terminal 2 - Start the frontend:"
echo "      cd frontend"
echo "      npm run dev"
echo ""
echo -e "${YELLOW}3. Access the Application:${NC}"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 API Docs: http://localhost:8000/docs"
echo "   💚 Health Check: http://localhost:8000/api/health"
echo ""
echo -e "${YELLOW}4. Development:${NC}"
echo "   📚 Read the documentation:"
echo "      • README.md - Project overview"
echo "      • DEVELOPER_GUIDE.md - Development guide"
echo "      • server/README.md - Server documentation"
echo "      • frontend/README.md - Frontend documentation"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "   • Always activate the virtual environment before working: source venv/bin/activate"
echo "   • Check the logs if something doesn't work"
echo "   • Environment variables require server restart to take effect"
echo "   • Use 'deactivate' to exit the virtual environment"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
