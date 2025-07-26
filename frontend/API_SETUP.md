# Frontend API Configuration

## Environment Setup

1. **Create `.env.local` file** in the frontend directory with:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_API_KEY=scammer-sim-api-2025-secure-key-xyz789
   NEXT_PUBLIC_ENVIRONMENT=development
   ```

2. **Make sure the API key matches** the one in your backend `.env` file

## How API Authentication Works

### 1. Environment Variables
- `NEXT_PUBLIC_API_KEY` - The API key that matches your backend server
- `NEXT_PUBLIC_API_URL` - The base URL of your backend API

### 2. Authentication Headers
All authenticated requests include:
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer your-api-key-here"
}
```

### 3. API Endpoints

- **Health Check** (No auth required): `GET /api/health`
- **Generate Reply** (Auth required): `POST /api/generate-reply`
- **Classify Email** (Auth required): `POST /api/classify`

## Usage Examples

### Basic API Call
```typescript
import { createApiUrl, getAuthHeaders, API_CONFIG } from "@/lib/api-config";

const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.GENERATE_REPLY), {
  method: "POST",
  headers: getAuthHeaders(),
  body: JSON.stringify({ conversation: [...] }),
});
```

### Using the Classification API
```typescript
import { classifyEmail } from "@/lib/api-utils";

const result = await classifyEmail("Suspicious email content here...");
console.log(result.label); // "Scam", "Safe", etc.
console.log(result.tags);  // ["Phishing", "Banking"]
console.log(result.justification); // Explanation
```

## Security Notes

1. **Environment Variables**: The `NEXT_PUBLIC_` prefix makes variables available in the browser
2. **API Key Security**: In production, consider using server-side API calls to hide the key
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: The backend has built-in rate limiting per IP

## Troubleshooting

### "Unauthorized" Error
- Check that `NEXT_PUBLIC_API_KEY` matches the backend `API_KEY`
- Verify the Authorization header is being sent
- Check that the backend server is running

### "CORS" Error
- Ensure your frontend URL is in the backend's `ALLOWED_ORIGINS`
- Check that the backend CORS middleware is configured correctly

### Connection Issues
- Verify `NEXT_PUBLIC_API_URL` points to the correct backend
- Check that the backend server is running on the specified port
- Test the health endpoint directly: `http://localhost:8000/api/health`
