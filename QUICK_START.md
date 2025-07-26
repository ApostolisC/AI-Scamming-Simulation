# Quick Start Guide

## 🚀 Automated Setup

### For Windows Users

#### Option 1: PowerShell (Recommended)
```powershell
# Run in PowerShell as Administrator (if needed for execution policy)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then run the setup script
.\setup.ps1
```

#### Option 2: Command Prompt
```cmd
setup.bat
```

### For macOS/Linux Users

```bash
# Make script executable (if needed)
chmod +x setup.sh

# Run the setup script
./setup.sh
```

## 📋 What the Setup Script Does

1. **✅ Checks System Requirements**
   - Python 3.11+
   - Node.js 18+
   - npm

2. **🐍 Sets Up Python Environment**
   - Creates virtual environment (`venv/`)
   - Activates virtual environment
   - Upgrades pip
   - Installs all Python dependencies

3. **📦 Installs Dependencies**
   - FastAPI, Uvicorn, Pydantic
   - Transformers, PyTorch, Requests
   - Development tools (pytest, black, etc.)
   - Frontend Node.js packages

4. **⚙️ Creates Configuration Files**
   - Copies `server/.env.example` to `server/.env`
   - Copies `frontend/.env.local.example` to `frontend/.env.local`

5. **🧪 Tests Installation**
   - Verifies Python dependencies
   - Tests frontend build process

## 🔑 Manual Configuration Required

After running the setup script, you need to configure API keys:

### 1. Get Hugging Face Token
1. Visit: https://huggingface.co/settings/tokens
2. Create a new token with **read** access
3. Copy the token

### 2. Configure Server Environment
Edit `server/.env`:
```env
# Replace with your actual tokens
HF_TOKEN_PRED=hf_your_token_here
HF_TOKEN_GEN=hf_your_token_here

# Create a secure API key
API_KEY=your-secure-api-key-here
```

### 3. Configure Frontend Environment
Edit `frontend/.env.local`:
```env
# Must match the API_KEY in server/.env
NEXT_PUBLIC_API_KEY=your-secure-api-key-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 Running the Application

### Terminal 1: Start the Server
```bash
# Windows
cd server
..\venv\Scripts\activate
python server.py

# macOS/Linux
cd server
source ../venv/bin/activate
python server.py
```

### Terminal 2: Start the Frontend
```bash
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## 🛠️ Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Python Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Files
```bash
# Server
cp server/.env.example server/.env

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

## 💡 Troubleshooting

### Python Issues
- **"Python not found"**: Install Python 3.11+ from python.org
- **"Virtual environment failed"**: Check Python installation and permissions

### Node.js Issues
- **"Node not found"**: Install Node.js 18+ from nodejs.org
- **"npm install failed"**: Try `npm cache clean --force`

### Permission Issues (Windows)
- **PowerShell execution policy**: Run as Administrator and execute:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

### Environment Variables
- Remember to restart the server after changing `.env` files
- Check that API keys match between server and frontend configurations

## 📚 Next Steps

1. Read the [README.md](README.md) for project overview
2. Check [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for development details
3. Review [SECURITY.md](SECURITY.md) for security best practices
4. See component-specific READMEs in `server/` and `frontend/` directories

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Create an issue on GitHub with error details
4. Include your operating system and software versions
