/**
 * Design tokens for Bống Cà Phê POS.
 * Use these in inline styles to ensure consistent spacing, colors, and typography.
 * All colors follow the dark theme.
 */

import type { CSSProperties } from 'react';

// Color tokens
export const colors = {
  // Backgrounds
  bgPage: '#0f172a',
  bgSurface: '#1e293b',

  // Text
  textMain: '#f1f5f9',
  textMuted: '#94a3b8',

  // Borders
  border: '#334155',

  // Status
  statusAvailable: '#8fbc8f',
  statusOccupied: '#f59e0b',

  // Accent
  accent: '#3498db',
  accentHover: '#2980b9',

  // Table specific
  tableBanner: '#7c3aed',
  tableAvailable: '#14b8a6',
  tableOccupied: '#f59e0b',
  statusDotAvailable: '#22c55e',
  statusDotOccupied: '#ef4444',
} as const;

// Spacing tokens (in px)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 15,
  lg: 20,
  xl: 24,
} as const;

// Border radius tokens
export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
} as const;

// Shadow tokens
export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.1)',
  cardHover: '0 8px 25px rgba(0,0,0,0.3)',
  tableDefault: '0 4px 12px rgba(0,0,0,0.2)',
  tableHover: '0 8px 25px rgba(0,0,0,0.3)',
  header: '0 -2px 10px rgba(0,0,0,0.35)',
} as const;

// Font sizes
export const fontSizes = {
  sm: '13px',
  md: '14px',
  base: '16px',
  lg: '18px',
  xl: '24px',
} as const;

// Common style factories
export const tableCardContainer = (isHovered: boolean): CSSProperties => ({
  width: '100%',
  aspectRatio: '2.5 / 1',
  borderRadius: `${radius.lg}px`,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
  boxShadow: isHovered ? shadows.tableHover : shadows.tableDefault,
});

export const tableBanner = {
  height: '30%',
  backgroundColor: colors.tableBanner,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${spacing.sm} ${spacing.md}px`,
  boxSizing: 'border-box' as const,
};

export const tableBody = (
  status: 'available' | 'occupied'
): CSSProperties => ({
  height: '70%',
  backgroundColor: status === 'available' ? colors.tableAvailable : colors.tableOccupied,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${spacing.md}px`,
  boxSizing: 'border-box' as const,
  position: 'relative' as const,
});

export const statusDot = (status: 'available' | 'occupied'): CSSProperties => ({
  position: 'absolute' as const,
  bottom: `${spacing.sm}px`,
  right: '12px',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor:
    status === 'available' ? colors.statusDotAvailable : colors.statusDotOccupied,
  border: '2px solid white',
});

export const paymentButton: CSSProperties = {
  backgroundColor: colors.accent,
  color: 'white',
  border: 'none',
  borderRadius: `${radius.sm}px`,
  padding: '12px 25px',
  fontSize: fontSizes.base,
  fontWeight: 600,
  cursor: 'pointer',
};

export const actionButton: CSSProperties = {
  flex: 1,
  padding: `${spacing.sm}px ${spacing.sm + 2}px`,
  fontSize: fontSizes.sm,
  fontWeight: 600,
  borderRadius: `${radius.sm}px`,
  border: `1px solid var(--border)`,
  background: 'var(--bg-surface)',
  color: 'var(--text-main)',
  cursor: 'pointer',
};

export const bottomBar: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  maxWidth: '480px',
  margin: '0 auto',
  backgroundColor: colors.bgSurface,
  padding: `${spacing.md}px ${spacing.lg}px`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: shadows.header,
  zIndex: 100,
  borderTop: `1px solid var(--border)`,
};