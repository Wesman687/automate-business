import React from 'react';

export interface StreamlineAIBadgeProps {
  style?: 'minimalist' | 'professional' | 'corner' | 'minimal' | 'dark' | 'glassmorphism' | 'neon' | 'gradient' | 'outline';
  position?: 'inline' | 'fixed';
  fixedPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center-top' | 'center-bottom';
  customUrl?: string;
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  animation?: 'none' | 'pulse' | 'bounce' | 'glow' | 'float' | 'shake';
  icon?: 'lightning' | 'check' | 'star' | 'heart' | 'rocket' | 'code' | 'none';
  customIcon?: string;
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  shadow?: 'none' | 'small' | 'medium' | 'large' | 'glow';
  className?: string;
  onClick?: () => void;
}

const StreamlineAIBadge: React.FC<StreamlineAIBadgeProps> = ({ 
  style = 'minimalist', 
  position = 'inline',
  fixedPosition = 'bottom-right',
  customUrl = 'https://stream-lineai.com',
  text = 'Designed by StreamlineAI',
  textColor,
  backgroundColor,
  borderColor,
  size = 'medium',
  animation = 'none',
  icon = 'lightning',
  customIcon,
  borderRadius = 'medium',
  shadow = 'medium',
  className = '',
  onClick
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Size configurations - ultra compact like the backend
  const sizeConfig = {
    small: { padding: '1px 3px', fontSize: '8px', iconSize: '9px' },
    medium: { padding: '2px 4px', fontSize: '10px', iconSize: '11px' },
    large: { padding: '3px 6px', fontSize: '12px', iconSize: '13px' },
    xl: { padding: '4px 8px', fontSize: '14px', iconSize: '15px' }
  };

  // Border radius configurations - matching backend smaller values
  const radiusConfig = {
    none: '0px',
    small: '4px',
    medium: '8px',
    large: '15px',
    full: '25px'
  };

  // Shadow configurations
  const shadowConfig = {
    none: 'none',
    small: '0 1px 3px rgba(0,0,0,0.1)',
    medium: '0 4px 12px rgba(0,0,0,0.15)',
    large: '0 8px 24px rgba(0,0,0,0.2)',
    glow: '0 0 20px rgba(0, 212, 255, 0.4)'
  };

  // Fixed position configurations
  const positionConfig = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'center-top': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
    'center-bottom': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
  };

  // Animation keyframes
  const animations: Record<string, string> = {
    none: 'none',
    pulse: 'pulse 2s infinite',
    bounce: 'bounce 2s infinite',
    glow: 'glow 2s ease-in-out infinite alternate',
    float: 'float 3s ease-in-out infinite',
    shake: 'shake 0.5s ease-in-out infinite'
  };

  const getBaseStyles = (): React.CSSProperties => {
    const config = sizeConfig[size];
    const baseStyle: React.CSSProperties = {
      display: position === 'fixed' ? 'flex' : 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: config.padding,
      fontSize: config.fontSize,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '500',
      textDecoration: 'none',
      borderRadius: radiusConfig[borderRadius],
      boxShadow: shadowConfig[shadow],
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      border: 'none',
      animation: animations[animation] || 'none'
    };

    if (position === 'fixed') {
      baseStyle.position = 'fixed';
      baseStyle.zIndex = 1000;
      Object.assign(baseStyle, positionConfig[fixedPosition]);
    }

    return baseStyle;
  };

  const baseStyles = getBaseStyles();

  const styles: Record<string, React.CSSProperties> = {
    minimalist: {
      ...baseStyles,
      background: backgroundColor || 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
      color: textColor || 'white',
      border: borderColor ? `1px solid ${borderColor}` : 'none'
    },
    professional: {
      ...baseStyles,
      background: backgroundColor || 'white',
      color: textColor || '#333',
      border: borderColor ? `1px solid ${borderColor}` : '1px solid #e0e0e0'
    },
    corner: {
      ...baseStyles,
      background: backgroundColor || 'rgba(0, 212, 255, 0.95)',
      color: textColor || 'white',
      backdropFilter: 'blur(10px)',
      border: borderColor ? `1px solid ${borderColor}` : '1px solid rgba(255,255,255,0.2)'
    },
    minimal: {
      ...baseStyles,
      background: backgroundColor || 'transparent',
      color: textColor || '#666',
      borderBottom: borderColor ? `1px solid ${borderColor}` : '1px solid transparent',
      opacity: 0.8,
      boxShadow: 'none'
    },
    dark: {
      ...baseStyles,
      background: backgroundColor || 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      color: textColor || '#00d4ff',
      border: borderColor ? `1px solid ${borderColor}` : '1px solid #333'
    },
    glassmorphism: {
      ...baseStyles,
      background: backgroundColor || 'rgba(255, 255, 255, 0.15)',
      color: textColor || 'white', // Default white text as requested!
      backdropFilter: 'blur(20px)',
      border: borderColor ? `1px solid ${borderColor}` : '1px solid rgba(255, 255, 255, 0.2)'
    },
    neon: {
      ...baseStyles,
      background: backgroundColor || 'rgba(0, 0, 0, 0.8)',
      color: textColor || 'currentColor',
      border: borderColor ? `2px solid ${borderColor}` : '2px solid #00d4ff',
      boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(0, 212, 255, 0.1)',
      borderRadius: '15px'
    },
    gradient: {
      ...baseStyles,
      background: backgroundColor || 'linear-gradient(45deg, #00d4ff, #0099cc, #667eea, #764ba2)',
      backgroundSize: '300% 300%',
      color: textColor || 'white',
      animation: 'gradientShift 3s ease infinite',
      borderRadius: '20px'
    },
    outline: {
      ...baseStyles,
      background: backgroundColor || 'transparent',
      color: textColor || 'currentColor',
      border: borderColor ? `2px solid ${borderColor}` : '2px solid #00d4ff',
      boxShadow: 'none',
      borderRadius: '15px'
    }
  };

  const getHoverStyle = (): React.CSSProperties => {
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
      case 'dark':
        return { 
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
        };
      case 'glassmorphism':
        return { 
          transform: 'translateY(-2px)',
          background: 'rgba(255, 255, 255, 0.25)'
        };
      default:
        return {};
    }
  };

  const renderIcon = () => {
    const config = sizeConfig[size];
    const iconSize = config.iconSize;
    
    if (customIcon) {
      return <span style={{ marginRight: '6px' }}>{customIcon}</span>;
    }
    
    if (icon === 'none') return null;
    
    const iconStyle = { 
      width: iconSize, 
      height: iconSize, 
      marginRight: '6px' 
    };
    
    switch (icon) {
      case 'lightning':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
        );
      case 'check':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case 'star':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      case 'heart':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        );
      case 'rocket':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        );
      case 'code':
        return (
          <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
        );
      default:
        return <span style={{ marginRight: '6px' }}>⚡</span>;
    }
  };

  const renderContent = () => {
    switch (style) {
      case 'professional':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '2px', 
              height: '12px', 
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)', 
              borderRadius: '1px', 
              marginRight: '6px' 
            }}></div>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '1px', fontSize: sizeConfig[size].fontSize }}>Powered by</div>
              <div style={{ fontWeight: '700', color: '#00d4ff', fontSize: `${parseInt(sizeConfig[size].fontSize) + 1}px` }}>StreamlineAI</div>
            </div>
          </div>
        );
      case 'minimal':
        return (
          <>
            Made with ❤️ by <span style={{ color: textColor || '#00d4ff', fontWeight: '600' }}>StreamlineAI</span>
          </>
        );
      case 'dark':
        return (
          <>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              background: textColor || 'currentColor', 
              borderRadius: '50%', 
              marginRight: '6px',
              animation: animation === 'pulse' ? 'pulse 2s infinite' : 'none'
            }}></div>
            {text}
          </>
        );
      case 'neon':
        return (
          <>
            ⚡ StreamlineAI Powered
          </>
        );
      case 'gradient':
        return (
          <>
            💎 StreamlineAI
          </>
        );
      case 'outline':
        return (
          <>
            ✨ StreamlineAI
          </>
        );
      default:
        return (
          <>
            {renderIcon()}
            {text}
          </>
        );
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
            40%, 43% { transform: translate3d(0, -10px, 0); }
            70% { transform: translate3d(0, -5px, 0); }
            90% { transform: translate3d(0, -2px, 0); }
          }
          @keyframes glow {
            from { box-shadow: 0 0 5px currentColor; }
            to { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `
      }} />
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
    </>
  );
};

// Export for both named and default imports to work with JS and TS
export { StreamlineAIBadge };
export default StreamlineAIBadge;
