# Security Requirements and Installation Guide

## Required Python Packages

```bash
pip install fastapi uvicorn python-multipart python-dotenv
pip install httpx requests pydantic[email]
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Set your secure API key:
   ```
   API_KEY=your-very-secure-api-key-here
   ```
3. Set your HuggingFace token:
   ```
   HF_TOKEN=your-hf-token-here
   ```
4. Configure allowed origins for your frontend:
   ```
   ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
   ```

## Security Improvements Made

### 1. **Authentication & Authorization**
- Added API key authentication using Bearer tokens
- All sensitive endpoints now require valid API key
- Health check endpoint remains public for monitoring

### 2. **Input Validation & Sanitization**
- Comprehensive Pydantic models with validators
- Text length limits to prevent abuse
- Content sanitization and validation
- Maximum conversation length limits

### 3. **Rate Limiting**
- IP-based rate limiting (10 requests per minute by default)
- Configurable through environment variables
- Memory-efficient sliding window implementation

### 4. **CORS Security**
- Restricted to specific allowed origins (no more wildcard)
- Disabled credentials for better security
- Limited HTTP methods to only necessary ones

### 5. **Error Handling & Logging**
- Comprehensive error handling with proper HTTP status codes
- Detailed logging without exposing sensitive information
- Structured logging with timestamps and levels

### 6. **Network Security**
- TrustedHost middleware to prevent Host header attacks
- Configurable host binding (defaults to localhost)
- Request timeouts for external API calls

### 7. **Secrets Management**
- All sensitive data moved to environment variables
- No hardcoded API tokens or secrets
- Example environment file provided

### 8. **Production Readiness**
- Proper async/await usage with thread pools
- Response models for consistent API responses
- Health check endpoint for monitoring
- Configurable documentation endpoints

### 9. **Code Quality**
- Removed duplicate imports
- Proper error propagation
- Type hints throughout
- Clear separation of concerns

## Usage Examples

### Authentication
```bash
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"text":"Is this email safe?"}' \
     http://localhost:8000/api/classify
```

### Frontend Integration
```javascript
const response = await fetch('/api/classify', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text: emailContent })
});
```

## Migration from Old Server

1. Install new dependencies
2. Set up environment variables
3. Update frontend to include Authorization header
4. Test all endpoints with new authentication
5. Monitor logs for any issues

## Security Considerations for Production

1. **Use HTTPS**: Always use TLS/SSL in production
2. **API Key Management**: Use a proper secret management system
3. **Database**: Consider storing API keys in a database with hashing
4. **Monitoring**: Set up proper monitoring and alerting
5. **Backup**: Regular backups of configuration and logs
6. **Updates**: Keep dependencies updated for security patches
