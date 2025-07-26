# Server - FastAPI Backend

A secure FastAPI server providing authenticated endpoints for AI-powered scam simulation and spam detection.

## 🎯 Purpose

The server component acts as the secure API layer between the frontend interface and the AI backend modules. It provides:
- Authenticated access to AI text generation
- Spam classification services
- Rate limiting and security controls
- Comprehensive input validation

## 🚀 Quick Start for Users

### Prerequisites
- Python 3.11+
- pip (Python package manager)

### 1. Environment Setup
```bash
cd server
cp .env.example .env
```

### 2. Configure Your API Keys
Edit `.env` file with your credentials:
```env
# Required: Hugging Face tokens for AI models. One model is for prediction and the other for response generation
HF_TOKEN_PRED=your-huggingface-token-here
HF_TOKEN_GEN=your-huggingface-token-here

# Required: API key for server authentication
API_KEY=your-secure-api-key-here

# Optional: Server configuration
PORT=8000
HOST=localhost
CORS_ORIGINS=["http://localhost:3000"]
```

### 3. Get Hugging Face Tokens
1. Visit [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with read access
3. Copy the token to both `HF_TOKEN_PRED` and `HF_TOKEN_GEN`

### 4. Install and Run
```bash
# Install dependencies
pip install fastapi uvicorn python-dotenv pydantic

# Start the server
python server.py
```

### 5. Verify Installation
- Server: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

## 📖 API Reference

### Authentication
All endpoints (except health) require API key authentication:
```bash
Authorization: Bearer your-api-key-here
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns server status (no authentication required).

#### Generate Reply
```http
POST /api/generate-reply
Content-Type: application/json
Authorization: Bearer your-api-key

{
    "conversation": "Previous conversation context",
    "persona": "scammer",
    "style": "urgent"
}
```

#### Classify Text (Spam Detection)
```http
POST /api/classify
Content-Type: application/json
Authorization: Bearer your-api-key

{
    "text": "Message to classify"
}
```

### Response Format
All API responses follow this structure:
```json
{
    "success": true,
    "data": "response content",
    "timestamp": "2025-07-26T10:30:00Z"
}
```

Error responses:
```json
{
    "success": false,
    "error": "Error description",
    "timestamp": "2025-07-26T10:30:00Z"
}
```

## 🛠️ For Developers

### Architecture

The server implements a layered security architecture:

```
Request → Rate Limiter → CORS → Authentication → Validation → AI Backend → Response
```

### Key Components

#### Security Middleware Stack
```python
# Rate limiting with sliding window
rate_limiter = RateLimiter(max_requests=100, window_minutes=1)

# CORS configuration
CORSMiddleware(
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"]
)

# API key authentication
HTTPBearer(auto_error=False)
```

#### Input Validation
Uses Pydantic v2 models with comprehensive validation:
```python
class GenerateRequest(BaseModel):
    conversation: str = Field(..., min_length=1, max_length=10000)
    persona: str = Field(default="scammer", pattern="^(scammer|victim)$")
    style: str = Field(default="neutral", pattern="^(neutral|urgent|friendly)$")
    
    @field_validator('conversation')
    @classmethod
    def validate_conversation(cls, v):
        # Custom validation logic
        return v
```

#### Rate Limiting Implementation
```python
class RateLimiter:
    def __init__(self, max_requests: int, window_minutes: int):
        self.max_requests = max_requests
        self.window_seconds = window_minutes * 60
        self.requests = defaultdict(list)
    
    def is_allowed(self, client_ip: str) -> bool:
        # Sliding window rate limiting logic
```

### Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `API_KEY` | Yes | Authentication key for API access | None |
| `HF_TOKEN_PRED` | Yes | Hugging Face token for prediction models | None |
| `HF_TOKEN_GEN` | Yes | Hugging Face token for generation models | None |
| `PORT` | No | Server port | 8000 |
| `HOST` | No | Server host | localhost |
| `CORS_ORIGINS` | No | Allowed CORS origins | `["http://localhost:3000"]` |
| `RATE_LIMIT_REQUESTS` | No | Rate limit max requests | 100 |
| `RATE_LIMIT_WINDOW` | No | Rate limit window (minutes) | 1 |

### Development Setup

#### Install Development Dependencies
```bash
pip install fastapi uvicorn python-dotenv pydantic pytest httpx
```

#### Run in Development Mode
```bash
# With auto-reload
uvicorn server:app --reload --host localhost --port 8000

# Or using the script
python server.py
```

#### Testing

Test health endpoint:
```bash
curl http://localhost:8000/api/health
```

Test with authentication:
```bash
curl -X POST \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"text":"Test message"}' \
  http://localhost:8000/api/classify
```

#### Debug Mode
Set environment variable for detailed logging:
```bash
DEBUG=true python server.py
```

### Security Features

#### Authentication System
- Bearer token authentication using API keys
- Configurable API key via environment variables
- Automatic rejection of unauthenticated requests

#### Rate Limiting
- Sliding window algorithm
- Per-IP tracking
- Configurable limits and windows
- Automatic cleanup of old requests

#### Input Validation
- Pydantic models with strict validation
- Field-level validators for custom logic
- Automatic sanitization and type checking
- Maximum length limits on inputs

#### CORS Security
- Configurable allowed origins
- Explicit method and header controls
- Credential handling support

### Backend Integration

The server integrates with AI models in the `../backend/generative/` directory:

```python
# Text generation
from backend.generative.genai4 import generate_reply

# Spam classification  
from backend.generative.mistral import classify_spam
```

### Error Handling

Comprehensive error handling with logging:
```python
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    logger.error(f"Validation error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": "Invalid input format"}
    )
```

### Logging

Structured logging throughout the application:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

### Performance Considerations

- Asynchronous request handling with FastAPI
- Efficient rate limiting with time-based cleanup
- Minimal memory footprint for request tracking
- Optimized AI model loading and caching

### Deployment

#### Production Configuration
```env
# Use strong, unique API key
API_KEY=super-secure-production-key

# Restrict CORS to your domain
CORS_ORIGINS=["https://yourdomain.com"]

# Adjust rate limits for production load
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60
```

#### Docker Support (Optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "server.py"]
```

### Troubleshooting

#### Common Issues

1. **401 Unauthorized**
   - Check API_KEY in .env file
   - Verify Authorization header format: `Bearer your-key`

2. **429 Rate Limited**
   - Check rate limiting configuration
   - Wait for rate limit window to reset

3. **500 Internal Server Error**
   - Check Hugging Face tokens are valid
   - Verify backend modules are accessible
   - Check server logs for detailed errors

4. **CORS Issues**
   - Verify CORS_ORIGINS includes your frontend URL
   - Check frontend is sending requests to correct server URL

#### Debug Steps
1. Check server logs for errors
2. Verify environment variables are loaded
3. Test health endpoint first
4. Use API documentation at `/docs` for testing
5. Check network connectivity to Hugging Face

### Contributing

When contributing to the server:
1. Follow FastAPI best practices
2. Add comprehensive input validation
3. Include proper error handling
4. Update API documentation
5. Test all endpoints thoroughly
6. Maintain security standards
