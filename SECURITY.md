# Security Guide - ScamSimAI

## 🔒 Overview

This security guide outlines the security measures, best practices, and configurations implemented in the ScamSimAI project. Following these guidelines ensures secure deployment and operation of the application.

## 🛡️ Security Architecture

### Defense in Depth Strategy

The application implements multiple layers of security:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Security                         │
│ • Environment variable validation                            │
│ • HTTPS enforcement (production)                             │
│ • Input sanitization                                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Network Security                         │
│ • CORS protection                                            │
│ • Rate limiting                                              │
│ • API authentication                                         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Application Security                       │
│ • Bearer token authentication                                │
│ • Input validation with Pydantic                            │
│ • Error handling and logging                                │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Backend Security                         │
│ • Secure token management                                    │
│ • Model access controls                                      │
│ • Resource limiting                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Authentication & Authorization

### API Key Management

#### Server Configuration
```bash
# Generate strong API key (recommended: 32+ characters)
API_KEY=your-super-secure-long-random-api-key-here

# Use different keys for different environments
# Development
API_KEY=dev-api-key-12345

# Production  
API_KEY=prod-$(openssl rand -hex 32)
```

#### Key Generation Best Practices
```bash
# Generate secure random API key
openssl rand -hex 32

# Or using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Frontend Authentication
```typescript
// Secure header configuration
const getAuthHeaders = () => ({
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  'Content-Type': 'application/json'
});

// Validate API key presence
if (!process.env.NEXT_PUBLIC_API_KEY) {
  throw new Error('NEXT_PUBLIC_API_KEY is required');
}
```

### Token Security

#### Hugging Face Tokens
```bash
# Use read-only tokens when possible
HF_TOKEN_PRED=hf_readonly_token_for_prediction
HF_TOKEN_GEN=hf_readonly_token_for_generation

# Rotate tokens regularly (recommended: every 90 days)
# Set expiration dates when creating tokens
```

#### Token Storage
- **Never commit tokens to version control**
- **Use environment variables exclusively**
- **Implement token rotation procedures**
- **Monitor token usage and access logs**

## 🚧 Input Validation & Sanitization

### Server-side Validation

#### Pydantic Models with Validation
```python
from pydantic import BaseModel, Field, field_validator
import re

class GenerateRequest(BaseModel):
    conversation: str = Field(..., min_length=1, max_length=10000)
    persona: str = Field(default="scammer", pattern="^(scammer|victim)$")
    style: str = Field(default="neutral", pattern="^(neutral|urgent|friendly)$")
    
    @field_validator('conversation')
    @classmethod
    def validate_conversation(cls, v):
        # Remove potentially harmful content
        if re.search(r'<script|javascript:|data:', v, re.IGNORECASE):
            raise ValueError("Invalid content detected")
        
        # Limit special characters
        if len(re.findall(r'[<>"\']', v)) > 10:
            raise ValueError("Too many special characters")
            
        return v.strip()

class ClassifyRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    
    @field_validator('text')
    @classmethod
    def validate_text(cls, v):
        # Basic sanitization
        cleaned = re.sub(r'[^\w\s\.,!?-]', '', v)
        return cleaned.strip()
```

#### Input Sanitization Functions
```python
import html
import re
from typing import Optional

def sanitize_input(text: str) -> Optional[str]:
    """Comprehensive input sanitization"""
    if not text or not text.strip():
        return None
    
    # HTML escape
    text = html.escape(text)
    
    # Remove control characters
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    
    # Limit consecutive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove potential XSS patterns
    xss_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript:',
        r'data:',
        r'vbscript:',
        r'on\w+\s*=',
    ]
    
    for pattern in xss_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
    
    return text.strip()

def validate_length(text: str, max_length: int = 10000) -> bool:
    """Validate input length"""
    return 0 < len(text.strip()) <= max_length

def check_rate_limit_compliance(text: str) -> bool:
    """Check if input suggests rate limit abuse"""
    # Detect repeated patterns that might indicate automation
    words = text.split()
    if len(set(words)) < len(words) * 0.3:  # Too many repeated words
        return False
    return True
```

### Frontend Validation

#### Client-side Sanitization
```typescript
// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, '') // Remove data: URLs
    .trim();
};

export const validateInput = (input: string): { valid: boolean; error?: string } => {
  if (!input.trim()) {
    return { valid: false, error: 'Input cannot be empty' };
  }
  
  if (input.length > 10000) {
    return { valid: false, error: 'Input too long (max 10,000 characters)' };
  }
  
  if (/<script|javascript:|data:/i.test(input)) {
    return { valid: false, error: 'Invalid content detected' };
  }
  
  return { valid: true };
};
```

## 🌐 Network Security

### CORS Configuration

#### Secure CORS Setup
```python
from fastapi.middleware.cors import CORSMiddleware

# Production CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],  # Specific origins only
    allow_credentials=True,
    allow_methods=["POST", "GET"],  # Minimal methods
    allow_headers=["Authorization", "Content-Type"],  # Specific headers only
    expose_headers=["X-Request-ID"],  # Minimal exposed headers
)

# Development CORS (more permissive)
if os.getenv("ENVIRONMENT") == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["POST", "GET"],
        allow_headers=["*"],
    )
```

#### Environment-based Configuration
```python
import os
from typing import List

def get_cors_origins() -> List[str]:
    """Get CORS origins based on environment"""
    env = os.getenv("ENVIRONMENT", "development")
    
    if env == "production":
        return [
            "https://yourdomain.com",
            "https://www.yourdomain.com"
        ]
    elif env == "staging":
        return [
            "https://staging.yourdomain.com",
            "http://localhost:3000"
        ]
    else:  # development
        return ["http://localhost:3000"]
```

### Rate Limiting

#### Advanced Rate Limiting
```python
from collections import defaultdict
from time import time
from typing import Dict, List
import asyncio

class AdvancedRateLimiter:
    def __init__(self, max_requests: int = 100, window_minutes: int = 1):
        self.max_requests = max_requests
        self.window_seconds = window_minutes * 60
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.blocked_ips: Dict[str, float] = {}
        
    def is_allowed(self, client_ip: str) -> bool:
        current_time = time()
        
        # Check if IP is temporarily blocked
        if client_ip in self.blocked_ips:
            if current_time < self.blocked_ips[client_ip]:
                return False
            else:
                del self.blocked_ips[client_ip]
        
        # Clean old requests
        cutoff_time = current_time - self.window_seconds
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if req_time > cutoff_time
        ]
        
        # Check rate limit
        if len(self.requests[client_ip]) >= self.max_requests:
            # Block IP for progressive duration
            block_count = getattr(self, f'_block_count_{client_ip}', 0) + 1
            setattr(self, f'_block_count_{client_ip}', block_count)
            block_duration = min(300, 60 * block_count)  # Max 5 minutes
            self.blocked_ips[client_ip] = current_time + block_duration
            return False
        
        # Add current request
        self.requests[client_ip].append(current_time)
        return True
    
    def get_remaining_requests(self, client_ip: str) -> int:
        """Get remaining requests for IP"""
        current_requests = len(self.requests.get(client_ip, []))
        return max(0, self.max_requests - current_requests)
```

#### Per-endpoint Rate Limiting
```python
class EndpointRateLimiter:
    def __init__(self):
        self.limiters = {
            "/api/generate-reply": AdvancedRateLimiter(20, 1),  # More restrictive
            "/api/classify": AdvancedRateLimiter(50, 1),        # Moderate
            "/api/health": AdvancedRateLimiter(100, 1),         # Permissive
        }
    
    def is_allowed(self, endpoint: str, client_ip: str) -> bool:
        limiter = self.limiters.get(endpoint)
        if not limiter:
            return True
        return limiter.is_allowed(client_ip)
```

## 🔐 Environment Security

### Environment Variable Management

#### Secure Environment Files
```bash
# .env (never commit this file)
API_KEY=prod-super-secure-api-key-32-chars-minimum
HF_TOKEN_PRED=hf_secure_readonly_token_here
HF_TOKEN_GEN=hf_secure_readonly_token_here
CORS_ORIGINS=["https://yourdomain.com"]
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60

# .env.example (safe to commit)
API_KEY=your-api-key-here
HF_TOKEN_PRED=your-huggingface-token-here
HF_TOKEN_GEN=your-huggingface-token-here
CORS_ORIGINS=["http://localhost:3000"]
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1
```

#### Environment Validation
```python
import os
from typing import Optional

class EnvironmentValidator:
    @staticmethod
    def validate_required_vars() -> None:
        """Validate all required environment variables"""
        required_vars = [
            "API_KEY",
            "HF_TOKEN_PRED", 
            "HF_TOKEN_GEN"
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    @staticmethod
    def validate_api_key() -> None:
        """Validate API key strength"""
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise ValueError("API_KEY is required")
        
        if len(api_key) < 32:
            raise ValueError("API_KEY must be at least 32 characters long")
        
        if api_key in ["your-api-key-here", "test", "dev"]:
            raise ValueError("API_KEY appears to be a placeholder or weak key")
    
    @staticmethod
    def validate_tokens() -> None:
        """Validate Hugging Face tokens"""
        tokens = ["HF_TOKEN_PRED", "HF_TOKEN_GEN"]
        for token_name in tokens:
            token = os.getenv(token_name)
            if not token:
                raise ValueError(f"{token_name} is required")
            
            if not token.startswith("hf_"):
                raise ValueError(f"{token_name} appears to be invalid (should start with 'hf_')")

# Use at startup
try:
    EnvironmentValidator.validate_required_vars()
    EnvironmentValidator.validate_api_key()
    EnvironmentValidator.validate_tokens()
except ValueError as e:
    logger.error(f"Environment validation failed: {e}")
    exit(1)
```

### Git Security

#### Comprehensive .gitignore
```bash
# Environment files
.env
.env.local
.env.production
.env.staging
*.env

# Explicitly allow example files
!.env.example
!.env.local.example

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.next/
out/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log
server/api.log

# Model files (if storing locally)
models/
*.bin
*.safetensors

# Security
keys/
certificates/
*.key
*.pem
*.crt

# Temporary files
tmp/
temp/
cache/
```

#### Pre-commit Hooks
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Check for sensitive patterns
if grep -r --include="*.py" --include="*.js" --include="*.ts" --include="*.json" -E "(api_key|secret|password|token)\s*=\s*['\"][^'\"]{10,}" .; then
    echo "Error: Potential secrets found in files!"
    echo "Please use environment variables for sensitive data."
    exit 1
fi

# Check for .env files being committed
if git diff --cached --name-only | grep -E "^\.env$|^\.env\.local$|^\.env\.production$"; then
    echo "Error: Attempting to commit .env file!"
    echo "These files contain secrets and should not be committed."
    exit 1
fi

# Check for large model files
if git diff --cached --name-only | xargs ls -la | awk '$5 > 100000000'; then
    echo "Error: Large files detected (>100MB)!"
    echo "Consider using Git LFS for model files."
    exit 1
fi

echo "Pre-commit checks passed."
```

## 🏭 Production Security

### HTTPS Configuration

#### Frontend HTTPS
```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://yourdomain.com/:path*',
        permanent: true,
      },
    ]
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
  },
}
```

#### Server HTTPS with Reverse Proxy
```nginx
# nginx configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
}
```

### Monitoring & Logging

#### Security Logging
```python
import logging
import json
from datetime import datetime
from typing import Dict, Any

class SecurityLogger:
    def __init__(self):
        self.logger = logging.getLogger("security")
        self.logger.setLevel(logging.INFO)
        
        # Security log handler
        handler = logging.FileHandler("security.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_auth_attempt(self, client_ip: str, success: bool, endpoint: str):
        """Log authentication attempts"""
        event = {
            "event_type": "auth_attempt",
            "client_ip": client_ip,
            "success": success,
            "endpoint": endpoint,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.info(json.dumps(event))
    
    def log_rate_limit_exceeded(self, client_ip: str, endpoint: str):
        """Log rate limit violations"""
        event = {
            "event_type": "rate_limit_exceeded",
            "client_ip": client_ip,
            "endpoint": endpoint,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.warning(json.dumps(event))
    
    def log_suspicious_input(self, client_ip: str, input_data: str, reason: str):
        """Log suspicious input patterns"""
        event = {
            "event_type": "suspicious_input",
            "client_ip": client_ip,
            "input_length": len(input_data),
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.warning(json.dumps(event))

# Usage in middleware
security_logger = SecurityLogger()

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    client_ip = request.client.host
    
    # Log all requests
    security_logger.log_auth_attempt(
        client_ip, 
        "Authorization" in request.headers,
        request.url.path
    )
    
    response = await call_next(request)
    return response
```

#### Performance Monitoring
```python
import time
from functools import wraps

def monitor_performance(func):
    """Monitor function performance"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration = time.time() - start_time
            
            # Log slow requests
            if duration > 5.0:  # 5 seconds threshold
                logger.warning(f"Slow request: {func.__name__} took {duration:.2f}s")
            
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"Request failed: {func.__name__} after {duration:.2f}s - {e}")
            raise
    return wrapper

# Apply to endpoints
@app.post("/api/generate-reply")
@monitor_performance
async def generate_reply_endpoint(request: GenerateRequest):
    # Endpoint implementation
    pass
```

## 🔍 Security Auditing

### Regular Security Checks

#### Automated Security Scanning
```bash
#!/bin/bash
# security_audit.sh

echo "Starting security audit..."

# Check for hardcoded secrets
echo "Checking for hardcoded secrets..."
if grep -r --include="*.py" --include="*.js" --include="*.ts" -i "password\|secret\|key.*=" . | grep -v ".env.example"; then
    echo "WARNING: Potential hardcoded secrets found!"
else
    echo "✓ No hardcoded secrets detected"
fi

# Check file permissions
echo "Checking file permissions..."
find . -name "*.env" -exec ls -la {} \;
find . -name "*.key" -exec ls -la {} \;

# Check for vulnerable dependencies
echo "Checking Python dependencies..."
pip list --outdated

echo "Checking Node.js dependencies..."
cd frontend && npm audit

# Check for exposed .git directory
if [ -d ".git" ]; then
    echo "✓ .git directory present (ensure it's not accessible in production)"
fi

echo "Security audit complete."
```

#### Dependency Scanning
```python
# security_check.py
import subprocess
import json
import sys

def check_python_vulnerabilities():
    """Check for known vulnerabilities in Python packages"""
    try:
        result = subprocess.run(['pip', 'list', '--format=json'], 
                              capture_output=True, text=True)
        packages = json.loads(result.stdout)
        
        # You can integrate with vulnerability databases here
        # For example, using safety: pip install safety
        safety_result = subprocess.run(['safety', 'check', '--json'], 
                                     capture_output=True, text=True)
        
        if safety_result.returncode != 0:
            print("Security vulnerabilities found in Python packages!")
            print(safety_result.stdout)
            return False
        else:
            print("✓ No known vulnerabilities in Python packages")
            return True
    except Exception as e:
        print(f"Error checking Python vulnerabilities: {e}")
        return False

def check_node_vulnerabilities():
    """Check for known vulnerabilities in Node.js packages"""
    try:
        result = subprocess.run(['npm', 'audit', '--json'], 
                              cwd='frontend', capture_output=True, text=True)
        audit_data = json.loads(result.stdout)
        
        if audit_data.get('metadata', {}).get('vulnerabilities', {}).get('total', 0) > 0:
            print("Security vulnerabilities found in Node.js packages!")
            print(result.stdout)
            return False
        else:
            print("✓ No known vulnerabilities in Node.js packages")
            return True
    except Exception as e:
        print(f"Error checking Node.js vulnerabilities: {e}")
        return False

if __name__ == "__main__":
    python_safe = check_python_vulnerabilities()
    node_safe = check_node_vulnerabilities()
    
    if not (python_safe and node_safe):
        sys.exit(1)
    
    print("All security checks passed!")
```

### Security Checklist

#### Pre-deployment Security Checklist

- [ ] **Environment Variables**
  - [ ] All secrets in environment variables (not hardcoded)
  - [ ] Strong API keys (32+ characters)
  - [ ] Environment files not committed to Git
  - [ ] Example files created with placeholder values

- [ ] **Authentication & Authorization**
  - [ ] API key authentication implemented
  - [ ] Bearer token format enforced
  - [ ] Token validation on all protected endpoints
  - [ ] Proper error messages (no information leakage)

- [ ] **Input Validation**
  - [ ] All inputs validated with Pydantic
  - [ ] XSS protection implemented
  - [ ] SQL injection protection (if applicable)
  - [ ] Input length limits enforced
  - [ ] Special character filtering

- [ ] **Network Security**
  - [ ] CORS properly configured for production
  - [ ] Rate limiting implemented and tested
  - [ ] HTTPS enforced in production
  - [ ] Security headers configured

- [ ] **Error Handling**
  - [ ] No sensitive information in error messages
  - [ ] Proper HTTP status codes
  - [ ] Comprehensive logging without exposing secrets
  - [ ] Graceful degradation for AI service failures

- [ ] **Dependencies**
  - [ ] All dependencies up to date
  - [ ] Security audit of dependencies completed
  - [ ] No known vulnerabilities in packages
  - [ ] Minimal dependency footprint

- [ ] **Monitoring**
  - [ ] Security logging implemented
  - [ ] Performance monitoring in place
  - [ ] Rate limit monitoring
  - [ ] Error rate monitoring

## 🚨 Incident Response

### Security Incident Procedures

#### Immediate Response
1. **Identify the Issue**
   - Monitor logs for suspicious activity
   - Check rate limit violations
   - Review authentication failures

2. **Contain the Threat**
   - Block suspicious IP addresses
   - Rotate compromised API keys
   - Temporarily increase rate limits

3. **Assess Impact**
   - Review affected systems
   - Check for data exposure
   - Evaluate service availability

4. **Recovery**
   - Deploy security patches
   - Update authentication credentials
   - Restore normal operations

#### API Key Compromise Response
```python
# emergency_key_rotation.py
import os
import secrets

def rotate_api_key():
    """Generate new API key and update environment"""
    new_key = secrets.token_urlsafe(32)
    
    # Update environment file
    with open('.env', 'r') as f:
        content = f.read()
    
    # Replace old key
    updated_content = content.replace(
        f"API_KEY={os.getenv('API_KEY')}", 
        f"API_KEY={new_key}"
    )
    
    with open('.env', 'w') as f:
        f.write(updated_content)
    
    print(f"New API key generated: {new_key}")
    print("Update frontend environment and restart services")

if __name__ == "__main__":
    rotate_api_key()
```

### Contact Information

For security issues:
1. Create a private issue in the repository
2. Contact maintainers directly
3. Follow responsible disclosure practices

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [FastAPI Security Documentation](https://fastapi.tiangolo.com/tutorial/security/)
- [Next.js Security Guidelines](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Hugging Face Security Best Practices](https://huggingface.co/docs/hub/security)

## 🔄 Regular Maintenance

### Monthly Security Tasks
- [ ] Review and rotate API keys
- [ ] Update all dependencies
- [ ] Run security audit scripts
- [ ] Review access logs
- [ ] Test backup and recovery procedures

### Quarterly Security Tasks
- [ ] Full security assessment
- [ ] Penetration testing (if applicable)
- [ ] Review and update security policies
- [ ] Staff security training
- [ ] Disaster recovery testing
