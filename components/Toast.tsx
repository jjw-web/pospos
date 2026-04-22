import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDone: () => void;
  durationMs?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onDone, durationMs = 2200 }) => {
  useEffect(() => {
    const t = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(t);
  }, [onDone, durationMs]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
    transform: 'translateX(-50%)',
    zIndex: 2000,
    maxWidth: 'min(90vw, 360px)',
    padding: '12px 18px',
    borderRadius: '12px',
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    color: '#f8fafc',
    fontSize: '15px',
    fontWeight: 500,
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    pointerEvents: 'none',
  };

  return <div style={style} role="status">{message}</div>;
};

export default React.memo(Toast);
