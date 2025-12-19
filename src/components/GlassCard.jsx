import React from 'react';
import './GlassCard.css';

const GlassCard = ({ children, className = '', onClick, padding = '1.5rem' }) => {
  const style = {
    padding,
    cursor: onClick ? 'pointer' : 'default'
  };

  return (
    <div 
      className={`glass-card ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};

export default GlassCard;