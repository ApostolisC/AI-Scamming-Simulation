# AI Scamming Simulation

A sophisticated AI-powered platform for simulating and detecting scam communications. This tool helps users understand scammer tactics through realistic conversations and provides spam detection capabilities.

## 🎯 Overview

AI-Scamming-Simulation consists of three main components:
- **Frontend**: Next.js-based web interface for user interactions
- **Backend**: Python modules for AI-powered text generation and classification
- **Server**: FastAPI server providing secure API endpoints

## 🚀 Quick Start for Users

### Prerequisites
- **Node.js 18+** and npm
- **Python 3.11+**
- **Hugging Face account** (for AI model access)

### Option 1: Automated Setup (Recommended) ⚡

The easiest way to get started is using our automated setup script:

```bash
# Clone the repository
git clone https://github.com/ApostolisC/AI-Scamming-Simulation
cd "AI-Scamming-Simulation"

# Run the automated setup script
python setup.py
```

The setup script will:
- ✅ Check system requirements
- ✅ Create a Python virtual environment
- ✅ Install all Python dependencies with live progress
- ✅ Install frontend dependencies
- ✅ Create environment files from templates
- ✅ Test the installation

### Option 2: Manual Installation 🔧

If you prefer manual setup or need to troubleshoot:

#### 1. Clone and Setup Virtual Environment
```bash
git clone https://github.com/ApostolisC/AI-Scamming-Simulation
cd "AI-Scamming-Simulation"

# Create and activate virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate
```

#### 2. Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### 3. Configure Environment Files
```bash
# Copy server environment template
cd server
cp .env.example .env
cd ..

# Copy frontend environment template
cd frontend
cp .env.local.example .env.local
cd ..
```

### Configure API Tokens 🔑

**Important**: You need **2 Hugging Face tokens** but you can use the **same token for both**.

#### Get Your Hugging Face Token:
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Give it a name (e.g., "AIScammingSimulation")
4. Select "Read" access
5. Click "Generate a token"
6. **Copy the token** (you won't see it again!)

#### Configure Tokens:
Edit `server/.env` and add:
```env
# Use the SAME Hugging Face token for both
HF_TOKEN_PRED=hf_your_token_here
HF_TOKEN_GEN=hf_your_token_here

# Create a secure API key (any random string)
API_KEY=your-secure-random-api-key-123
```

Edit `frontend/.env.local` and add:
```env
# Must match the API_KEY in server/.env
NEXT_PUBLIC_API_KEY=your-secure-random-api-key-123
```

### Start the Application 🚀

**Important**: Always activate the virtual environment first!

#### Terminal 1 - Start the Server:
```bash
# Activate virtual environment
# On Windows:
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

cd server
python server.py
```

#### Terminal 2 - Start the Frontend:
```bash
cd frontend
npm run dev
```

### Access the Application 🌐
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Server      │◄──►│    Backend      │
│   (Next.js)     │    │   (FastAPI)     │    │   (AI Models)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
AI-Scamming-Simulation/
├── frontend/           # Next.js web application
│   ├── components/     # React components
│   ├── lib/           # Utility functions and API config
│   └── app/           # App router pages
├── server/            # FastAPI server
│   └── server.py      # Main server application
├── backend/           # AI processing modules
│   └── generative/    # Text generation and classification
└── docs/              # Additional documentation
```

## 🔒 Security Features

- **API Key Authentication**: Secure endpoint access
- **Rate Limiting**: Prevents abuse and overuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Controlled cross-origin requests
- **Environment Variables**: Secure credential management

## 📚 Documentation

- [Server Documentation](server/README.md) - FastAPI server setup and API reference
- [Frontend Documentation](frontend/README.md) - Next.js application guide
- [Backend Documentation](backend/README.md) - AI model integration details
- [Security Guide](SECURITY.md) - Security best practices and guidelines
- [Developer Guide](DEVELOPER_GUIDE.md) - Comprehensive development documentation

## 🛠️ Development

### For Developers
Each component has its own detailed README with development instructions:
- See `server/README.md` for API development
- See `frontend/README.md` for UI development
- See `backend/README.md` for AI model integration

**Important**: Always work within the virtual environment:
```bash
# Activate virtual environment first
# On Windows:
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Then run your development commands
python server/server.py
# or
cd frontend && npm run dev
```

### Testing
```bash
# Test server endpoints (make sure server is running)
curl http://localhost:8000/api/health

# Test with authentication
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"text":"Test message"}' \
     http://localhost:8000/api/classify
```

## 🆘 Troubleshooting

### Common Issues

**"Command not found" errors:**
- Make sure Node.js and Python are installed and in your PATH
- Restart your terminal after installing Node.js
- Run `python --version` and `node --version` to verify

**Virtual environment issues:**
- Always activate the virtual environment before running Python commands
- If activation fails, try recreating: `rm -rf venv` then `python -m venv venv`

**npm install fails:**
- Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- Make sure you're in the `frontend` directory

**Server won't start:**
- Check that you've activated the virtual environment
- Verify your `.env` file has the correct Hugging Face tokens
- Make sure no other service is using port 8000

**Frontend build fails:**
- Check that your `.env.local` file exists and has the correct API key
- Make sure the API key matches between server and frontend env files

**Hugging Face token errors:**
- Verify your token has "Read" permissions
- Make sure you're using the same token for both `HF_TOKEN_PRED` and `HF_TOKEN_GEN`
- Check that there are no extra spaces in your `.env` file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational and research purposes only. It simulates scammer tactics to help users recognize and avoid real scams. Use responsibly and ethically.

## 🆘 Support

- **First**: Try the automated setup script: `python setup.py`
- Check the documentation in each component's README
- Review the troubleshooting section above
- Review the [Security Guide](SECURITY.md) for security-related questions
- Open an issue for bugs or feature requests

## 🔄 Version History

- **v2.0.0** - Secure FastAPI server with authentication
- **v1.0.0** - Initial release with basic functionality
