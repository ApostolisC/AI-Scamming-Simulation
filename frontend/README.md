# Frontend - Next.js Web Application

A modern, responsive web interface for AI-powered scam simulation and spam detection, built with Next.js 14 and React.

## 🎯 Purpose

The frontend provides an intuitive user interface for:
- Interactive scam conversation simulations
- Real-time spam detection and classification
- Conversation management and history
- Theme customization and user preferences

## 🚀 Quick Start for Users

### Prerequisites
- Node.js 18+ and npm
- Running FastAPI server (see `../server/README.md`)

### 1. Environment Setup
```bash
cd frontend
cp .env.local.example .env.local
```

### 2. Configure Environment Variables
Edit `.env.local` with your settings:
```env
# API Configuration (Required)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-api-key-here

# Development Settings (Optional)
NEXT_PUBLIC_ENVIRONMENT=development
```

**Important:** The `NEXT_PUBLIC_API_KEY` must match the `API_KEY` in your server configuration.

### 3. Install and Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or for production
npm run build
npm start
```

### 4. Access the Application
- Development: http://localhost:3000
- The application will automatically connect to your FastAPI server

## 🎨 Features

### Conversation Simulation
- **Interactive Chat Interface**: Realistic scam conversation simulation
- **Multiple Personas**: Switch between scammer and victim perspectives
- **Style Controls**: Adjust conversation tone and urgency
- **Real-time Generation**: Instant AI-powered response generation

### Spam Detection
- **Text Analysis**: Paste or type text for spam classification
- **Confidence Scoring**: Detailed probability scores for classification
- **Instant Results**: Real-time analysis with visual feedback

### User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Themes**: Customizable theme preferences
- **Conversation History**: Save and revisit previous conversations
- **Clean Interface**: Intuitive, distraction-free design

## 🛠️ For Developers

### Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **State Management**: React Context API
- **HTTP Client**: Native fetch with custom configurations

### Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   └── [conversationId]/  # Dynamic conversation routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Conversations.tsx # Conversation list component
│   ├── ConversationView.tsx # Main chat interface
│   ├── EmailTurnForm.tsx # Message composition
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── SpamCheck.tsx     # Spam detection interface
│   └── ThemeCustomizer.tsx # Theme selection
├── contexts/             # React contexts
│   └── ThemeContext.tsx  # Theme management
├── lib/                  # Utility functions
│   ├── api-config.ts     # API configuration
│   ├── storage.ts        # Local storage utilities
│   └── utils.ts          # General utilities
└── public/               # Static assets
```

### Key Components

#### API Configuration (`lib/api-config.ts`)
Centralized API configuration with authentication:
```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
} as const;

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${API_CONFIG.apiKey}`,
  'Content-Type': 'application/json'
});
```

#### Conversation Management (`components/ConversationView.tsx`)
Main chat interface with real-time message generation:
```typescript
const handleSendMessage = async (message: string, persona: string, style: string) => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/generate-reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        conversation: currentConversation,
        persona,
        style
      })
    });
    // Handle response...
  } catch (error) {
    // Error handling...
  }
};
```

#### Spam Detection (`components/SpamCheck.tsx`)
Text classification interface:
```typescript
const handleCheckSpam = async () => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/classify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text: inputText })
    });
    // Process classification results...
  } catch (error) {
    // Error handling...
  }
};
```

#### Theme Management (`contexts/ThemeContext.tsx`)
Centralized theme state with persistence:
```typescript
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  
  // Theme persistence and management logic
};
```

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | FastAPI server URL | `http://localhost:8000` |
| `NEXT_PUBLIC_API_KEY` | Yes | API authentication key | `your-secure-api-key` |
| `NEXT_PUBLIC_ENVIRONMENT` | No | Environment identifier | `development` |

**Security Note:** All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive server-side secrets in these variables.

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

### Component Development

#### Creating New Components
Follow the established patterns:
```typescript
// components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="component-container">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default NewComponent;
```

#### Styling Guidelines
- Use Tailwind CSS classes for styling
- Follow responsive design principles
- Maintain consistency with existing components
- Use CSS variables for theme colors

#### API Integration
Always use the centralized API configuration:
```typescript
import { API_CONFIG, getAuthHeaders } from '@/lib/api-config';

const apiCall = async () => {
  const response = await fetch(`${API_CONFIG.baseURL}/api/endpoint`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
};
```

### State Management

#### Local Storage Utilities (`lib/storage.ts`)
Centralized storage management:
```typescript
export const storage = {
  conversations: {
    save: (conversations: Conversation[]) => {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    },
    load: (): Conversation[] => {
      // Load and parse conversations
    }
  },
  theme: {
    save: (theme: Theme) => {
      localStorage.setItem('theme', theme);
    },
    load: (): Theme => {
      // Load theme preference
    }
  }
};
```

#### Context Usage
```typescript
// Using theme context
const { theme, setTheme } = useTheme();

// Using in components
const MyComponent = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`component ${theme === 'dark' ? 'dark-mode' : ''}`}>
      Content
    </div>
  );
};
```

### Responsive Design

The application uses Tailwind's responsive utilities:
```tsx
<div className="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 md:gap-6
  p-4 md:p-6 lg:p-8
">
  {/* Responsive grid layout */}
</div>
```

### Error Handling

Implement comprehensive error handling:
```typescript
const handleApiError = (error: any) => {
  if (error.status === 401) {
    setError('Authentication failed. Please check your API key.');
  } else if (error.status === 429) {
    setError('Rate limit exceeded. Please try again later.');
  } else {
    setError('An unexpected error occurred. Please try again.');
  }
};
```

### Performance Optimization

#### Code Splitting
Next.js automatically code-splits at the page level. For additional optimization:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

#### Image Optimization
Use Next.js Image component:
```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority={false}
/>
```

### Testing

#### Component Testing Setup
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import Component from './Component';

test('renders component correctly', () => {
  render(<Component title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Deployment

#### Production Build
```bash
npm run build
npm start
```

#### Environment Configuration
Create production `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_API_KEY=production-api-key
NEXT_PUBLIC_ENVIRONMENT=production
```

#### Static Export (Optional)
For static hosting:
```bash
npm run build
npm run export
```

### Troubleshooting

#### Common Issues

1. **API Connection Failed**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Ensure FastAPI server is running
   - Check CORS configuration on server

2. **Authentication Errors**
   - Verify `NEXT_PUBLIC_API_KEY` matches server configuration
   - Check API key format in requests

3. **Build Errors**
   - Run `npm run type-check` for TypeScript errors
   - Check for missing dependencies
   - Verify environment variables are set

4. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting styles
   - Verify responsive classes are correct

#### Debug Steps
1. Check browser console for errors
2. Verify environment variables in browser dev tools
3. Test API endpoints directly
4. Check network tab for failed requests
5. Use React Developer Tools for component debugging

### Contributing

When contributing to the frontend:
1. Follow TypeScript best practices
2. Maintain responsive design principles
3. Use existing component patterns
4. Add proper error handling
5. Test across different screen sizes
6. Update documentation for new features
7. Follow the established code style

### Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

Modern browsers with ES2020 support.
