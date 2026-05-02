import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import type { ReactNode } from 'react';

export type AppTheme = 'dark';

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme: AppTheme = 'dark';

  const setTheme = useCallback((_t: AppTheme) => {
    // Theme is fixed to dark, no-op
  }, []);

  const toggleTheme = useCallback(() => {
    // Theme is fixed to dark, no-op
  }, []);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
