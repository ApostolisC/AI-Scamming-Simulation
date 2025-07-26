# ScamSimAI

A sophisticated AI-powered platform for simulating and detecting scam communications. This tool helps users understand scammer tactics through realistic conversations and provides spam detection capabilities.

## 🎯 Overview

ScamSimAI consists of three main components:
- **Frontend**: Next.js-based web interface for user interactions
- **Backend**: Python modules for AI-powered text generation and classification
- **Server**: FastAPI server providing secure API endpoints

## 🚀 Quick Start for Users

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Hugging Face account (for AI model access)

### 1. Clone and Setup
```bash
git clone https://github.com/ApostolisC/AI-Scammer-Simulation
cd AI\ Scammer\ Simulation
python3 setup.py
```

### 2. Configure Environment Variables
Copy the example files and add your API keys:

**Server Configuration:**
```bash
cd server
cp .env.example .env (setup.py script does it automatically)
# Edit .env with your API keys
```

**Frontend Configuration:**
```bash
cd frontend
cp .env.local.example .env.local (setup.py script does it automatically)
# Edit .env.local with your API configuration
```

### 3. Get Required API Tokens

**Hugging Face Tokens:**
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with read access. 2 tokens are required, 1 for prediction and 1 for response generation, but the same token can be used for both. 
3. Add tokens to `server/.env`:
   ```
   HF_TOKEN_PRED=your-token-here
   HF_TOKEN_GEN=your-token-here
   ```

**API Key:**
Generate a secure API key for your server:
```bash
# Use any secure random string
API_KEY=your-secure-api-key-here
```

### 4. Install Dependencies and Run

**Start the Server:**
```bash
cd server
pip install fastapi uvicorn python-dotenv pydantic
python server.py
```

**Start the Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access the Application:**
- Frontend: http://localhost:3000
- API Documentation: http://localhost:8000/docs

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
ScamSimAI/
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

### Testing
```bash
# Test server endpoints
curl http://localhost:8000/api/health

# Test with authentication
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"text":"Test message"}' \
     http://localhost:8000/api/classify
```

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

- Check the documentation in each component's README
- Review the [Security Guide](SECURITY.md) for security-related questions
- Open an issue for bugs or feature requests

## 🔄 Version History

- **v2.0.0** - Secure FastAPI server with authentication
- **v1.0.0** - Initial release with basic functionality
