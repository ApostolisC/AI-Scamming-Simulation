"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type ColorTheme = {
  primary: string;
  secondary: string;
  accent: string;
  sidebar: string;
  serverStatus: {
    connected: string;
    disconnected: string;
    checking: string;
  };
};

export type ThemeVariant = 'default' | 'dark' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan';

const themeVariants: Record<ThemeVariant, ColorTheme> = {
  default: {
    primary: '99, 102, 241', // Indigo
    secondary: '59, 130, 246', // Blue
    accent: '34, 197, 94', // Green
    sidebar: '30, 41, 59', // Slate
    serverStatus: {
      connected: '34, 197, 94', // Green
      disconnected: '239, 68, 68', // Red
      checking: '156, 163, 175', // Gray
    },
  },
  dark: {
    primary: '30, 41, 59', // Slate (dark)
    secondary: '51, 65, 85', // Slate (darker)
    accent: '99, 102, 241', // Indigo
    sidebar: '17, 24, 39', // Slate (darkest)
    serverStatus: {
      connected: '34, 197, 94', // Green
      disconnected: '239, 68, 68', // Red
      checking: '156, 163, 175', // Gray
    },
  },
  purple: {
    primary: '147, 51, 234', // Purple
    secondary: '168, 85, 247', // Purple light
    accent: '236, 72, 153', // Pink
    sidebar: '55, 48, 163', // Purple dark
    serverStatus: {
      connected: '34, 197, 94',
      disconnected: '239, 68, 68',
      checking: '156, 163, 175',
    },
  },
  green: {
    primary: '34, 197, 94', // Green
    secondary: '16, 185, 129', // Emerald
    accent: '59, 130, 246', // Blue
    sidebar: '6, 78, 59', // Green dark
    serverStatus: {
      connected: '34, 197, 94',
      disconnected: '239, 68, 68',
      checking: '156, 163, 175',
    },
  },
  orange: {
    primary: '249, 115, 22', // Orange
    secondary: '251, 146, 60', // Orange light
    accent: '245, 158, 11', // Amber
    sidebar: '154, 52, 18', // Orange dark
    serverStatus: {
      connected: '34, 197, 94',
      disconnected: '239, 68, 68',
      checking: '156, 163, 175',
    },
  },
  pink: {
    primary: '236, 72, 153', // Pink
    secondary: '244, 114, 182', // Pink light
    accent: '168, 85, 247', // Purple
    sidebar: '131, 24, 67', // Pink dark
    serverStatus: {
      connected: '34, 197, 94',
      disconnected: '239, 68, 68',
      checking: '156, 163, 175',
    },
  },
  cyan: {
    primary: '6, 182, 212', // Cyan
    secondary: '34, 211, 238', // Cyan light
    accent: '59, 130, 246', // Blue
    sidebar: '22, 78, 99', // Cyan dark
    serverStatus: {
      connected: '34, 197, 94',
      disconnected: '239, 68, 68',
      checking: '156, 163, 175',
    },
  },
};

interface ThemeContextType {
  currentTheme: ThemeVariant;
  colorTheme: ColorTheme;
  setTheme: (theme: ThemeVariant) => void;
  applyCustomColors: (colors: Partial<ColorTheme>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>('default');
  const [customColors, setCustomColors] = useState<Partial<ColorTheme>>({});

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeVariant;
    const savedCustomColors = localStorage.getItem('app-custom-colors');
    
    if (savedTheme && themeVariants[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
    
    if (savedCustomColors) {
      try {
        setCustomColors(JSON.parse(savedCustomColors));
      } catch (error) {
        console.error('Error parsing saved custom colors:', error);
      }
    }
  }, []);

  // Apply theme colors to CSS variables
  useEffect(() => {
    const baseTheme = themeVariants[currentTheme];
    const finalTheme = { ...baseTheme, ...customColors };

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-rgb', finalTheme.primary);
    root.style.setProperty('--secondary-rgb', finalTheme.secondary);
    root.style.setProperty('--accent-rgb', finalTheme.accent);
    root.style.setProperty('--sidebar-rgb', finalTheme.sidebar || finalTheme.primary);
    root.style.setProperty('--server-connected-rgb', finalTheme.serverStatus?.connected || '34, 197, 94');
    root.style.setProperty('--server-disconnected-rgb', finalTheme.serverStatus?.disconnected || '239, 68, 68');
    root.style.setProperty('--server-checking-rgb', finalTheme.serverStatus?.checking || '156, 163, 175');
  }, [currentTheme, customColors]);

  const setTheme = useCallback((theme: ThemeVariant) => {
    setCurrentTheme(theme);
    localStorage.setItem('app-theme', theme);
  }, []);

  const applyCustomColors = useCallback((colors: Partial<ColorTheme>) => {
    const newCustomColors = { ...customColors, ...colors };
    setCustomColors(newCustomColors);
    localStorage.setItem('app-custom-colors', JSON.stringify(newCustomColors));
  }, [customColors]);

  const colorTheme = useMemo(() => ({ 
    ...themeVariants[currentTheme], 
    ...customColors 
  }), [currentTheme, customColors]);

  const contextValue = useMemo(() => ({
    currentTheme,
    colorTheme,
    setTheme,
    applyCustomColors
  }), [currentTheme, colorTheme, setTheme, applyCustomColors]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
