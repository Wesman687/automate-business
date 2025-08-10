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
declare const StreamlineAIBadge: React.FC<StreamlineAIBadgeProps>;
export { StreamlineAIBadge };
export default StreamlineAIBadge;
