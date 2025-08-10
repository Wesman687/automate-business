// StreamlineAI Badge Component - Direct Copy & Paste Version
// Save this as StreamlineAIBadge.jsx in your React project

import React, { useState } from 'react';

const StreamlineAIBadge = ({ 
  style = 'minimalist', 
  customUrl = 'https://stream-lineai.com',
  text = 'Designed by StreamlineAI',
  className = '',
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    minimalist: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 16px',
      background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '25px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer'
    },
    professional: {
      display: 'inline-block',
      padding: '12px 20px',
      background: 'white',
      color: '#333',
      textDecoration: 'none',
      borderRadius: '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer'
    },
    corner: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      alignItems: 'center',
      padding: '8px 14px',
      background: 'rgba(0, 212, 255, 0.95)',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '12px',
      fontWeight: '600',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)',
      transition: 'all 0.3s ease',
      zIndex: 1000,
      cursor: 'pointer'
    },
    minimal: {
      display: 'inline-block',
      color: '#666',
      textDecoration: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '12px',
      fontWeight: '400',
      borderBottom: '1px solid transparent',
      transition: 'all 0.3s ease',
      opacity: 0.8,
      cursor: 'pointer'
    }
  };

  const getHoverStyle = () => {
    if (!isHovered) return {};
    
    switch (style) {
      case 'minimalist':
        return { transform: 'translateY(-2px) scale(1.05)' };
      case 'professional':
        return { 
          transform: 'translateY(-2px) scale(1.02)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        };
      case 'corner':
        return { 
          transform: 'scale(1.1)',
          background: 'rgba(0, 212, 255, 1)'
        };
      case 'minimal':
        return { 
          opacity: 1,
          borderBottom: '1px solid #00d4ff'
        };
      default:
        return {};
    }
  };

  const renderContent = () => {
    switch (style) {
      case 'minimalist':
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            {text}
          </>
        );
      case 'professional':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '3px', 
              height: '20px', 
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)', 
              borderRadius: '2px', 
              marginRight: '10px' 
            }}></div>
            <div>
              <div style={{ fontWeight: '600', color: '#333', marginBottom: '2px' }}>Powered by</div>
              <div style={{ fontWeight: '700', color: '#00d4ff', fontSize: '15px' }}>StreamlineAI</div>
            </div>
          </div>
        );
      case 'corner':
        return (
          <>
            <span style={{ marginRight: '6px' }}>⚡</span>
            StreamlineAI
          </>
        );
      case 'minimal':
        return (
          <>
            Made with ❤️ by <span style={{ color: '#00d4ff', fontWeight: '600' }}>StreamlineAI</span>
          </>
        );
      default:
        return text;
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <a
      href={customUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        ...styles[style],
        ...getHoverStyle()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {renderContent()}
    </a>
  );
};

export default StreamlineAIBadge;

/* 
USAGE EXAMPLES:

// Basic usage
<StreamlineAIBadge />

// Different styles
<StreamlineAIBadge style="professional" />
<StreamlineAIBadge style="corner" />
<StreamlineAIBadge style="minimal" />

// Custom options
<StreamlineAIBadge 
  style="minimalist"
  customUrl="https://your-website.com"
  text="Built with StreamlineAI"
  onClick={() => console.log('Badge clicked!')}
/>
*/
