import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Theme, ThemeContextType } from './themeTypes';
import { DEFAULT_THEME, THEME_STORAGE_KEY } from './themeTypes';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Apply primary color and its variants
  root.style.setProperty('--primary', theme.primaryColor);

  // Calculate hover state (darken by 15%)
  const hoverColor = adjustColorBrightness(theme.primaryColor, -15);
  root.style.setProperty('--primary-hover', hoverColor);

  // Calculate light variant (lighten by 50%)
  const lightColor = adjustColorBrightness(theme.primaryColor, 50);
  root.style.setProperty('--primary-light', lightColor);

  // Calculate gradient
  const gradientColor = adjustColorBrightness(theme.primaryColor, -5);
  root.style.setProperty(
    '--primary-gradient',
    `linear-gradient(135deg, ${theme.primaryColor} 0%, ${gradientColor} 100%)`
  );

  // Calculate glow effect
  const glowColor = hexToRgb(theme.primaryColor);
  root.style.setProperty('--primary-glow', `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, 0.22)`);

  // Apply secondary color if provided
  if (theme.secondaryColor) {
    root.style.setProperty('--primary-hover', theme.secondaryColor);
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 79, g: 82, b: 232 }; // fallback to default blue
}

function adjustColorBrightness(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  const r = Math.min(255, Math.max(0, rgb.r + (rgb.r * percent) / 100));
  const g = Math.min(255, Math.max(0, rgb.g + (rgb.g * percent) / 100));
  const b = Math.min(255, Math.max(0, rgb.b + (rgb.b * percent) / 100));
  return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
    .toString(16)
    .slice(1)}`;
}

function loadThemeFromStorage(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

function saveThemeToStorage(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error('Failed to save theme to storage:', error);
  }
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // Load theme from storage on mount
  useEffect(() => {
    const savedTheme = loadThemeFromStorage();
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    saveThemeToStorage(newTheme);
  };

  const updatePrimaryColor = (color: string) => {
    const newTheme = { ...theme, primaryColor: color };
    setTheme(newTheme);
  };

  const updateSecondaryColor = (color: string) => {
    const newTheme = { ...theme, secondaryColor: color };
    setTheme(newTheme);
  };

  const resetTheme = () => {
    setTheme(DEFAULT_THEME);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        updatePrimaryColor,
        updateSecondaryColor,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
