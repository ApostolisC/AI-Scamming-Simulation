import os
import logging
from datetime import datetime, timedelta
from typing import List, Literal, Optional
import asyncio
from collections import defaultdict

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, field_validator
from starlette.concurrency import run_in_threadpool
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Environment configuration
class Config:
    API_KEY = os.getenv("API_KEY", "your-secure-api-key-here")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    MAX_CONVERSATION_LENGTH = int(os.getenv("MAX_CONVERSATION_LENGTH", "5000"))
    MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "2000"))
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "10"))
    RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds

config = Config()

# Debug: Log configuration on startup
logger.info(f"API_KEY loaded: {config.API_KEY[:10]}...")
logger.info(f"ALLOWED_ORIGINS: {config.ALLOWED_ORIGINS}")
logger.info(f"Environment file should be in: {os.path.abspath('.env')}")

# Add path for backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from backend.generative.mistral import generate_reply as predict_reply
    from backend.generative.llama_3_2_3b_instruct import generate_reply
except ImportError as e:
    logger.error(f"Failed to import backend modules: {e}")
    raise

app = FastAPI(
    title="AI Scammer Simulation API",
    description="Secure API for scam detection and conversation simulation",
    version="2.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") == "development" else None
)

# Security middleware
security = HTTPBearer()

# Rate limiting
class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
    
    def is_allowed(self, client_ip: str) -> bool:
        now = datetime.now()
        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < timedelta(seconds=config.RATE_LIMIT_WINDOW)
        ]
        
        if len(self.requests[client_ip]) >= config.RATE_LIMIT_REQUESTS:
            return False
        
        self.requests[client_ip].append(now)
        return True

rate_limiter = RateLimiter()

# Dependency for rate limiting
def check_rate_limit(request: Request):
    client_ip = getattr(request.client, 'host', '127.0.0.1') if request.client else '127.0.0.1'
    if not rate_limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )

# Dependency for API authentication
def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    logger.info(f"Received API key: {credentials.credentials[:10]}...") # Log first 10 chars for debugging
    logger.info(f"Expected API key: {config.API_KEY[:10]}...")
    
    if credentials.credentials != config.API_KEY:
        logger.warning(f"Invalid API key attempt. Received: {credentials.credentials[:10]}..., Expected: {config.API_KEY[:10]}...")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    return credentials.credentials

# Add security middleware (temporarily disabled TrustedHostMiddleware for debugging)
# app.add_middleware(
#     TrustedHostMiddleware, 
#     allowed_hosts=["localhost", "127.0.0.1"]
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=False,  # Set to False for better security
    allow_methods=["POST", "GET", "OPTIONS"],  # Added OPTIONS for preflight requests
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin"],  # Added more headers
)

# Debug middleware to log all requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"[REQUEST] {request.method} {request.url}")
    logger.info(f"[HEADERS] {dict(request.headers)}")
    logger.info(f"[CLIENT] {request.client}")
    
    response = await call_next(request)
    
    logger.info(f"[RESPONSE] {response.status_code}")
    return response

# Pydantic models with validation
class Message(BaseModel):
    role: Literal["scammer", "user"]
    content: str = Field(..., min_length=1, max_length=1000)
    
    @field_validator('content')
    @classmethod
    def content_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v.strip()

class ConversationRequest(BaseModel):
    conversation: List[Message] = Field(..., min_length=1, max_length=50)
    
    @field_validator('conversation')
    @classmethod
    def validate_conversation_length(cls, v):
        total_length = sum(len(msg.content) for msg in v)
        if total_length > config.MAX_CONVERSATION_LENGTH:
            raise ValueError(f'Total conversation length cannot exceed {config.MAX_CONVERSATION_LENGTH} characters')
        return v

class EmailInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=config.MAX_TEXT_LENGTH)
    
    @field_validator('text')
    @classmethod
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty')
        return v.strip()

class ClassificationResponse(BaseModel):
    label: str
    tags: List[str]
    justification: str

class ReplyResponse(BaseModel):
    reply: str
    conversation_length: int

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime

# Error handling
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    logger.error(f"Validation error: {exc}")
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc)
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {exc}")
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error"
    )

# API Routes
@app.post("/api/classify", response_model=ClassificationResponse)
async def classify_email(
    data: EmailInput,
    request: Request,
    _: str = Depends(verify_api_key),
    __: None = Depends(check_rate_limit)
):
    """
    Classify an email or message as scam or safe.
    Requires API key authentication.
    """
    try:
        logger.info(f"Classification request from {getattr(request.client, 'host', 'unknown') if request.client else 'unknown'}")
        
        # Run AI prediction in thread pool to avoid blocking
        output = await run_in_threadpool(predict_reply, data.text)
        
        if not output:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate classification"
            )
        
        lines = output.splitlines()
        if len(lines) < 2:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Invalid classification response format"
            )
        
        labels = lines[0].split(",")
        prediction_label = labels[0].strip()
        tags = [tag.strip() for tag in labels[1:]] if len(labels) > 1 else []
        justification = lines[1].strip()
        
        logger.info(f"Classification completed: {prediction_label}")
        
        return ClassificationResponse(
            label=prediction_label,
            tags=tags,
            justification=justification
        )
        
    except Exception as e:
        logger.error(f"Classification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process classification request"
        )

@app.post("/api/generate-reply", response_model=ReplyResponse)
async def generate_reply_api(
    conversation: ConversationRequest,
    request: Request,
    _: str = Depends(verify_api_key),
    __: None = Depends(check_rate_limit)
):
    """
    Generate a reply based on conversation context.
    Requires API key authentication.
    """
    try:
        logger.info(f"Reply generation request from {getattr(request.client, 'host', 'unknown') if request.client else 'unknown'}")
        
        # Convert conversation to text
        conversation_text = "\n".join([
            f"{message.role.title()}: {message.content}"
            for message in conversation.conversation
        ])
        
        # Run AI generation in thread pool
        reply = await run_in_threadpool(generate_reply, conversation_text)
        
        if not reply:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate reply"
            )
        
        logger.info("Reply generation completed")
        
        return ReplyResponse(
            reply=reply.strip(),
            conversation_length=len(conversation_text)
        )
        
    except Exception as e:
        logger.error(f"Reply generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process reply generation request"
        )

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint - no authentication required."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now()
    )

# Remove the ping endpoint for security (use health instead)

if __name__ == "__main__":
    import uvicorn
    
    # Simple configuration for debugging
    uvicorn.run(
        "server:app",  # Use import string format 
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
