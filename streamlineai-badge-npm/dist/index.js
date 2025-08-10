'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var StreamlineAIBadge = function (_a) {
    var _b = _a.style, style = _b === void 0 ? 'minimalist' : _b, _c = _a.position, position = _c === void 0 ? 'inline' : _c, _d = _a.fixedPosition, fixedPosition = _d === void 0 ? 'bottom-right' : _d, _e = _a.customUrl, customUrl = _e === void 0 ? 'https://stream-lineai.com' : _e, _f = _a.text, text = _f === void 0 ? 'Designed by StreamlineAI' : _f, textColor = _a.textColor, backgroundColor = _a.backgroundColor, borderColor = _a.borderColor, _g = _a.size, size = _g === void 0 ? 'medium' : _g, _h = _a.animation, animation = _h === void 0 ? 'none' : _h, _j = _a.icon, icon = _j === void 0 ? 'lightning' : _j, customIcon = _a.customIcon, _k = _a.borderRadius, borderRadius = _k === void 0 ? 'medium' : _k, _l = _a.shadow, shadow = _l === void 0 ? 'medium' : _l, _m = _a.className, className = _m === void 0 ? '' : _m, onClick = _a.onClick;
    var _o = React.useState(false), isHovered = _o[0], setIsHovered = _o[1];
    // Size configurations - ultra compact like the backend
    var sizeConfig = {
        small: { padding: '1px 3px', fontSize: '8px', iconSize: '9px' },
        medium: { padding: '2px 4px', fontSize: '10px', iconSize: '11px' },
        large: { padding: '3px 6px', fontSize: '12px', iconSize: '13px' },
        xl: { padding: '4px 8px', fontSize: '14px', iconSize: '15px' }
    };
    // Border radius configurations - matching backend smaller values
    var radiusConfig = {
        none: '0px',
        small: '4px',
        medium: '8px',
        large: '15px',
        full: '25px'
    };
    // Shadow configurations
    var shadowConfig = {
        none: 'none',
        small: '0 1px 3px rgba(0,0,0,0.1)',
        medium: '0 4px 12px rgba(0,0,0,0.15)',
        large: '0 8px 24px rgba(0,0,0,0.2)',
        glow: '0 0 20px rgba(0, 212, 255, 0.4)'
    };
    // Fixed position configurations
    var positionConfig = {
        'top-left': { top: '20px', left: '20px' },
        'top-right': { top: '20px', right: '20px' },
        'bottom-left': { bottom: '20px', left: '20px' },
        'bottom-right': { bottom: '20px', right: '20px' },
        'center-top': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
        'center-bottom': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
    };
    // Animation keyframes
    var animations = {
        none: 'none',
        pulse: 'pulse 2s infinite',
        bounce: 'bounce 2s infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 3s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out infinite'
    };
    var getBaseStyles = function () {
        var config = sizeConfig[size];
        var baseStyle = {
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
    var baseStyles = getBaseStyles();
    var styles = {
        minimalist: __assign(__assign({}, baseStyles), { background: backgroundColor || 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)', color: textColor || 'white', border: borderColor ? "1px solid ".concat(borderColor) : 'none' }),
        professional: __assign(__assign({}, baseStyles), { background: backgroundColor || 'white', color: textColor || '#333', border: borderColor ? "1px solid ".concat(borderColor) : '1px solid #e0e0e0' }),
        corner: __assign(__assign({}, baseStyles), { background: backgroundColor || 'rgba(0, 212, 255, 0.95)', color: textColor || 'white', backdropFilter: 'blur(10px)', border: borderColor ? "1px solid ".concat(borderColor) : '1px solid rgba(255,255,255,0.2)' }),
        minimal: __assign(__assign({}, baseStyles), { background: backgroundColor || 'transparent', color: textColor || '#666', borderBottom: borderColor ? "1px solid ".concat(borderColor) : '1px solid transparent', opacity: 0.8, boxShadow: 'none' }),
        dark: __assign(__assign({}, baseStyles), { background: backgroundColor || 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', color: textColor || '#00d4ff', border: borderColor ? "1px solid ".concat(borderColor) : '1px solid #333' }),
        glassmorphism: __assign(__assign({}, baseStyles), { background: backgroundColor || 'rgba(255, 255, 255, 0.15)', color: textColor || 'white', backdropFilter: 'blur(20px)', border: borderColor ? "1px solid ".concat(borderColor) : '1px solid rgba(255, 255, 255, 0.2)' }),
        neon: __assign(__assign({}, baseStyles), { background: backgroundColor || 'rgba(0, 0, 0, 0.8)', color: textColor || 'currentColor', border: borderColor ? "2px solid ".concat(borderColor) : '2px solid #00d4ff', boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(0, 212, 255, 0.1)', borderRadius: '15px' }),
        gradient: __assign(__assign({}, baseStyles), { background: backgroundColor || 'linear-gradient(45deg, #00d4ff, #0099cc, #667eea, #764ba2)', backgroundSize: '300% 300%', color: textColor || 'white', animation: 'gradientShift 3s ease infinite', borderRadius: '20px' }),
        outline: __assign(__assign({}, baseStyles), { background: backgroundColor || 'transparent', color: textColor || 'currentColor', border: borderColor ? "2px solid ".concat(borderColor) : '2px solid #00d4ff', boxShadow: 'none', borderRadius: '15px' })
    };
    var getHoverStyle = function () {
        if (!isHovered)
            return {};
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
    var renderIcon = function () {
        var config = sizeConfig[size];
        var iconSize = config.iconSize;
        if (customIcon) {
            return React.createElement("span", { style: { marginRight: '6px' } }, customIcon);
        }
        if (icon === 'none')
            return null;
        var iconStyle = {
            width: iconSize,
            height: iconSize,
            marginRight: '6px'
        };
        switch (icon) {
            case 'lightning':
                return (React.createElement("svg", { style: iconStyle, viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" })));
            case 'check':
                return (React.createElement("svg", { style: iconStyle, viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" })));
            case 'star':
                return (React.createElement("svg", { style: iconStyle, viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" })));
            case 'heart':
                return (React.createElement("svg", { style: iconStyle, viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })));
            case 'rocket':
                return (React.createElement("svg", { style: iconStyle, viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" })));
            case 'code':
                return (React.createElement("svg", { style: iconStyle, viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" })));
            default:
                return React.createElement("span", { style: { marginRight: '6px' } }, "\u26A1");
        }
    };
    var renderContent = function () {
        switch (style) {
            case 'professional':
                return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    React.createElement("div", { style: {
                            width: '2px',
                            height: '12px',
                            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
                            borderRadius: '1px',
                            marginRight: '6px'
                        } }),
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontWeight: '600', marginBottom: '1px', fontSize: sizeConfig[size].fontSize } }, "Powered by"),
                        React.createElement("div", { style: { fontWeight: '700', color: '#00d4ff', fontSize: "".concat(parseInt(sizeConfig[size].fontSize) + 1, "px") } }, "StreamlineAI"))));
            case 'minimal':
                return (React.createElement(React.Fragment, null,
                    "Made with \u2764\uFE0F by ",
                    React.createElement("span", { style: { color: textColor || '#00d4ff', fontWeight: '600' } }, "StreamlineAI")));
            case 'dark':
                return (React.createElement(React.Fragment, null,
                    React.createElement("div", { style: {
                            width: '6px',
                            height: '6px',
                            background: textColor || 'currentColor',
                            borderRadius: '50%',
                            marginRight: '6px',
                            animation: animation === 'pulse' ? 'pulse 2s infinite' : 'none'
                        } }),
                    text));
            case 'neon':
                return (React.createElement(React.Fragment, null, "\u26A1 StreamlineAI Powered"));
            case 'gradient':
                return (React.createElement(React.Fragment, null, "\uD83D\uDC8E StreamlineAI"));
            case 'outline':
                return (React.createElement(React.Fragment, null, "\u2728 StreamlineAI"));
            default:
                return (React.createElement(React.Fragment, null,
                    renderIcon(),
                    text));
        }
    };
    var handleClick = function (e) {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("style", { dangerouslySetInnerHTML: {
                __html: "\n          @keyframes pulse {\n            0%, 100% { opacity: 1; transform: scale(1); }\n            50% { opacity: 0.7; transform: scale(1.1); }\n          }\n          @keyframes bounce {\n            0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }\n            40%, 43% { transform: translate3d(0, -10px, 0); }\n            70% { transform: translate3d(0, -5px, 0); }\n            90% { transform: translate3d(0, -2px, 0); }\n          }\n          @keyframes glow {\n            from { box-shadow: 0 0 5px currentColor; }\n            to { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }\n          }\n          @keyframes float {\n            0%, 100% { transform: translateY(0px); }\n            50% { transform: translateY(-10px); }\n          }\n          @keyframes shake {\n            0%, 100% { transform: translateX(0); }\n            25% { transform: translateX(-2px); }\n            75% { transform: translateX(2px); }\n          }\n          @keyframes gradientShift {\n            0% { background-position: 0% 50%; }\n            50% { background-position: 100% 50%; }\n            100% { background-position: 0% 50%; }\n          }\n        "
            } }),
        React.createElement("a", { href: customUrl, target: "_blank", rel: "noopener noreferrer", className: className, style: __assign(__assign({}, styles[style]), getHoverStyle()), onMouseEnter: function () { return setIsHovered(true); }, onMouseLeave: function () { return setIsHovered(false); }, onClick: handleClick }, renderContent())));
};

exports.StreamlineAIBadge = StreamlineAIBadge;
exports.default = StreamlineAIBadge;
