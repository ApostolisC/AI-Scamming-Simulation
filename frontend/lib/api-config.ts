// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  ENDPOINTS: {
    HEALTH: "/api/health",
    GENERATE_REPLY: "/api/generate-reply",
    CLASSIFY: "/api/classify"
  }
} as const;

// Helper function to create authenticated headers
export const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${API_CONFIG.API_KEY}`,
});

// Helper function to create API URLs
export const createApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;
