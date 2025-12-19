// src/components/UI/ThemeProvider.js
import React from 'react';
import './Theme.css';

const ThemeProvider = ({ children }) => {
  return (
    <div className="theme-container">
      {children}
    </div>
  );
};

export default ThemeProvider;