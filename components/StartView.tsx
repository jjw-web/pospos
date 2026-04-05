import React from 'react';
import startAnimation from '../src/assets/start-animation.gif';
import { useTheme } from '../src/context/ThemeContext';

interface StartViewProps {
  onStart: () => void;
}

const StartView: React.FC<StartViewProps> = ({ onStart }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mainContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100vw',
    padding: '0 15px',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: isDark ? '#0f172a' : '#f0f0f0',
    transition: 'background-color 0.2s ease',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '20px 0 10px 0',
    padding: '0 10px',
    textAlign: 'center',
    color: isDark ? '#f8fafc' : '#1e293b',
  };

  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    background: isDark ? '#1e293b' : '#e5e5e5',
    borderRadius: '20px',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    maxWidth: '350px',
    objectFit: 'contain',
    display: 'block',
  };

  return (
    <div style={mainContainerStyle}>
      <h1 style={titleStyle}>Bống Cà Phê</h1>
      
      <div style={imageContainerStyle}>
        <button onClick={onStart} style={{border: 'none', background: 'none', padding: 0, cursor: 'pointer'}}>
          <img src={startAnimation} alt="Bắt đầu" style={imageStyle} />
        </button>
      </div>
    </div>
  );
};

export default StartView;