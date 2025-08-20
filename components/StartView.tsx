import React from 'react';
import startAnimation from '../src/assets/start-animation.gif';

interface StartViewProps {
  onStart: () => void;
}

const StartView: React.FC<StartViewProps> = ({ onStart }) => {

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
    backgroundColor: '#f0f0f0',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '20px 0 10px 0',
    padding: '0 10px',
    textAlign: 'center',
  };

  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '100%',
    height: 'auto',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    background: '#e5e5e5',
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