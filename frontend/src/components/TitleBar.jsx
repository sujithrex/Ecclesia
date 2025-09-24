import React from 'react';
import './TitleBar.css';

const TitleBar = () => {
  const handleMinimize = () => {
    if (window.electron) {
      window.electron.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electron) {
      window.electron.maximize();
    }
  };

  const handleClose = () => {
    if (window.electron) {
      window.electron.close();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-content">
        <div className="title-bar-title">
          Ecclesia
        </div>
        <div className="title-bar-controls">
          <button className="title-bar-button minimize" onClick={handleMinimize}>
            <span className="title-bar-icon">−</span>
          </button>
          <button className="title-bar-button maximize" onClick={handleMaximize}>
            <span className="title-bar-icon">□</span>
          </button>
          <button className="title-bar-button close" onClick={handleClose}>
            <span className="title-bar-icon">×</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;