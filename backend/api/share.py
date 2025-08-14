from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse

router = APIRouter(prefix="/share", tags=["share"])

@router.get("/", response_class=HTMLResponse)
async def share_badges_page(request: Request):
    """Share page with StreamlineAI badges and embed codes"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StreamlineAI Badge Library - Free Embed Codes</title>
        <meta name="description" content="Professional embed badges for StreamlineAI-powered websites and applications. Copy & paste HTML and React components.">
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                color: #ffffff;
                line-height: 1.6;
                min-height: 100vh;
            }}
            
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
            }}
            
            .header {{
                text-align: center;
                margin-bottom: 60px;
            }}
            
            .logo {{
                font-size: 3em;
                font-weight: bold;
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 20px;
            }}
            
            .subtitle {{
                font-size: 1.2em;
                color: #ccc;
                margin-bottom: 30px;
            }}
            
            .hero-badge {{
                margin: 30px 0;
            }}
            
            .instructions {{
                background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.1) 100%);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 16px;
                padding: 30px;
                margin: 40px 0;
                text-align: left;
            }}
            
            .instructions h3 {{
                color: #00d4ff;
                font-size: 1.4em;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }}
            
            .instructions-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
                margin-top: 25px;
            }}
            
            .instruction-step {{
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }}
            
            .step-number {{
                background: #00d4ff;
                color: #000;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 15px;
                font-size: 14px;
            }}
            
            .step-title {{
                font-size: 1.1em;
                font-weight: 600;
                color: #fff;
                margin-bottom: 10px;
            }}
            
            .step-description {{
                color: #ccc;
                line-height: 1.6;
            }}
            
            .interactive-demo {{
                background: rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                padding: 30px;
                margin: 40px 0;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }}
            
            .demo-controls {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 25px 0;
            }}
            
            .control-group {{
                background: rgba(0, 0, 0, 0.3);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }}
            
            .control-label {{
                color: #00d4ff;
                font-size: 0.9em;
                font-weight: 600;
                margin-bottom: 8px;
                display: block;
            }}
            
            .control-select {{
                width: 100%;
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                padding: 8px 12px;
                color: #fff;
                font-size: 14px;
            }}
            
            .control-select option {{
                background: #1a1a1a;
                color: #fff;
            }}
            
            .control-select:focus {{
                outline: none;
                border-color: #00d4ff;
                box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
            }}
            
            .live-preview {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 40px;
                margin: 25px 0;
                text-align: center;
                min-height: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }}
            
            .code-output {{
                background: #0a0a0a;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                position: relative;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 13px;
                line-height: 1.6;
                overflow-x: auto;
            }}
            
            .code-output pre {{
                margin: 0;
                color: #e0e0e0;
            }}
            
            .badge-section {{
                background: rgba(255, 255, 255, 0.05);
                border-radius: 16px;
                padding: 30px;
                margin: 30px 0;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
            }}
            
            .badge-title {{
                font-size: 1.5em;
                font-weight: 600;
                margin-bottom: 15px;
                color: #00d4ff;
                display: flex;
                align-items: center;
                gap: 10px;
            }}
            
            .badge-description {{
                color: #ccc;
                margin-bottom: 25px;
                font-size: 1.1em;
            }}
            
            .preview-area {{
                background: rgba(0, 0, 0, 0.3);
                border-radius: 12px;
                padding: 50px 30px;
                margin: 20px 0;
                text-align: center;
                border: 2px dashed rgba(0, 212, 255, 0.3);
                min-height: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                width: 100%;
                box-sizing: border-box;
            }}
            
            /* Ensure preview doesn't interfere with badge styles */
            #live-preview {{
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }}
            
            /* Only override specific properties that need fixing */
            #live-preview a {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }}
            
            .code-container {{
                position: relative;
                margin: 20px 0;
            }}
            
            .code-block {{
                background: #0a0a0a;
                color: #e0e0e0;
                padding: 25px;
                border-radius: 12px;
                overflow-x: auto;
                font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                font-size: 14px;
                line-height: 1.5;
                border: 1px solid #333;
                position: relative;
            }}
            
            .copy-btn {{
                position: absolute;
                top: 15px;
                right: 15px;
                background: #00d4ff;
                color: #000;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                transition: all 0.3s ease;
                z-index: 10;
            }}
            
            .copy-btn:hover {{
                background: #00b8e6;
                transform: scale(1.05);
            }}
            
            .tabs {{
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }}
            
            .tab {{
                background: rgba(255, 255, 255, 0.1);
                color: #ccc;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }}
            
            .tab.active {{
                background: #00d4ff;
                color: #000;
                font-weight: 600;
            }}
            
            .tab-content {{
                display: none;
            }}
            
            .tab-content.active {{
                display: block;
            }}
            
            .features {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }}
            
            .feature {{
                background: rgba(255, 255, 255, 0.05);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }}
            
            .feature-icon {{
                font-size: 2em;
                margin-bottom: 10px;
            }}
            
            .cta {{
                background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                margin: 50px 0;
                color: white;
            }}
            
            .cta h2 {{
                font-size: 2em;
                margin-bottom: 15px;
            }}
            
            .cta-btn {{
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid white;
                padding: 15px 30px;
                border-radius: 8px;
                font-size: 1.1em;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
            }}
            
            .cta-btn:hover {{
                background: white;
                color: #00d4ff;
                transform: translateY(-2px);
            }}
            
            .footer {{
                text-align: center;
                padding: 40px 0;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                color: #666;
            }}
            
            @keyframes pulse {{
                0%, 100% {{ opacity: 1; transform: scale(1); }}
                50% {{ opacity: 0.7; transform: scale(1.1); }}
            }}
            
            @keyframes bounce {{
                0%, 20%, 50%, 80%, 100% {{ transform: translateY(0); }}
                40% {{ transform: translateY(-10px); }}
                60% {{ transform: translateY(-5px); }}
            }}
            
            @keyframes glow {{
                from {{ box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }}
                to {{ box-shadow: 0 0 20px rgba(0, 212, 255, 0.8), 0 0 30px rgba(0, 212, 255, 0.6); }}
            }}
            
            @keyframes float {{
                0%, 100% {{ transform: translateY(0px); }}
                50% {{ transform: translateY(-10px); }}
            }}
            
            @keyframes shake {{
                0%, 100% {{ transform: translateX(0); }}
                25% {{ transform: translateX(-2px); }}
                75% {{ transform: translateX(2px); }}
            }}
            
            @keyframes gradientShift {{
                0% {{ background-position: 0% 50%; }}
                50% {{ background-position: 100% 50%; }}
                100% {{ background-position: 0% 50%; }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">StreamlineAI</div>
                <div class="subtitle">Professional Badge Library</div>
                <p>Free embed codes for websites and applications powered by StreamlineAI</p>
                
                <div class="hero-badge">
                    <!-- Hero Badge Preview -->
                    <a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 12px 24px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; text-decoration: none; border-radius: 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 600; box-shadow: 0 4px 16px rgba(0, 212, 255, 0.4); transition: all 0.3s ease;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        Powered by StreamlineAI
                    </a>
                </div>
            </div>
            
            <!-- Instructions Section -->
            <div class="instructions">
                <h3>📚 How to Use StreamlineAI Badges</h3>
                <p style="color: #ccc; font-size: 1.1em; margin-bottom: 25px;">
                    Professional embed badges for your StreamlineAI-powered applications. Choose your style, customize, and copy the code!
                </p>
                
                <div class="instructions-grid">
                    <div class="instruction-step">
                        <div class="step-number">1</div>
                        <div class="step-title">Choose Your Style</div>
                        <div class="step-description">
                            Pick from 9 professional badge styles: minimalist, professional, glassmorphism, neon, gradient, and more.
                        </div>
                    </div>
                    
                    <div class="instruction-step">
                        <div class="step-number">2</div>
                        <div class="step-title">Customize Effects</div>
                        <div class="step-description">
                            Use our interactive demo below to customize colors, animations, positioning, and sizes in real-time.
                        </div>
                    </div>
                    
                    <div class="instruction-step">
                        <div class="step-number">3</div>
                        <div class="step-title">Copy & Paste</div>
                        <div class="step-description">
                            Get HTML for any website or install our React component: <code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">npm install streamlineai-badge</code>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Interactive Demo -->
            <div class="interactive-demo">
                <h3 style="color: #00d4ff; font-size: 1.5em; margin-bottom: 20px; text-align: center;">
                    🎨 Interactive Badge Customizer
                </h3>
                <p style="color: #ccc; text-align: center; margin-bottom: 30px;">
                    Customize your badge in real-time and copy the generated code!
                </p>
                
                <div class="demo-controls">
                    <div class="control-group">
                        <label class="control-label">Style</label>
                        <select class="control-select" id="style-select" onchange="updateBadge()">
                            <option value="minimalist">Minimalist</option>
                            <option value="professional">Professional</option>
                            <option value="glassmorphism">Glassmorphism</option>
                            <option value="dark">Dark</option>
                            <option value="neon">Neon</option>
                            <option value="gradient">Gradient</option>
                            <option value="outline">Outline</option>
                            <option value="corner">Corner</option>
                            <option value="minimal">Ultra Minimal</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label class="control-label">Size</label>
                        <select class="control-select" id="size-select" onchange="updateBadge()">
                            <option value="small">Small</option>
                            <option value="medium" selected>Medium</option>
                            <option value="large">Large</option>
                            <option value="xl">Extra Large</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label class="control-label">Animation</label>
                        <select class="control-select" id="animation-select" onchange="updateBadge()">
                            <option value="none">None</option>
                            <option value="pulse">Pulse</option>
                            <option value="bounce">Bounce</option>
                            <option value="glow">Glow</option>
                            <option value="float">Float</option>
                            <option value="shake">Shake</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label class="control-label">Position</label>
                        <select class="control-select" id="position-select" onchange="updateBadge()">
                            <option value="inline">Inline</option>
                            <option value="fixed">Fixed Float</option>
                        </select>
                    </div>
                    
                    <div class="control-group" id="fixed-position-group" style="display: none;">
                        <label class="control-label">Fixed Position</label>
                        <select class="control-select" id="fixed-position-select" onchange="updateBadge()">
                            <option value="top-left">Top Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="bottom-right" selected>Bottom Right</option>
                            <option value="center-top">Center Top</option>
                            <option value="center-bottom">Center Bottom</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label class="control-label">Text Color</label>
                        <select class="control-select" id="text-color-select" onchange="updateBadge()">
                            <option value="default">Default</option>
                            <option value="white">White</option>
                            <option value="black">Black</option>
                            <option value="#00d4ff">StreamlineAI Blue</option>
                            <option value="#ff6b6b">Red</option>
                            <option value="#4ecdc4">Teal</option>
                            <option value="#45b7d1">Blue</option>
                        </select>
                    </div>
                </div>
                
                <div class="live-preview" id="live-preview">
                    <!-- Badge will be rendered here -->
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <button onclick="copyGeneratedCode()" style="background: #00d4ff; color: #000; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
                        📋 Copy Generated Code
                    </button>
                </div>
                
                <div class="tabs" style="justify-content: center;">
                    <button class="tab active" onclick="showGeneratedTab('html')">HTML Code</button>
                    <button class="tab" onclick="showGeneratedTab('react')">React Code</button>
                </div>
                
                <div class="code-output">
                    <button class="copy-btn" onclick="copyGeneratedCode()" style="top: 10px; right: 10px;">📋 Copy</button>
                    <div id="generated-html" class="tab-content active">
                        <pre id="generated-html-code"><!-- Generated HTML will appear here --></pre>
                    </div>
                    <div id="generated-react" class="tab-content">
                        <pre id="generated-react-code"><!-- Generated React will appear here --></pre>
                    </div>
                </div>
            </div>
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <h3>Lightweight</h3>
                    <p>Under 1KB each, fast loading</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h3>Responsive</h3>
                    <p>Perfect on all devices</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <h3>6 Unique Styles</h3>
                    <p>From minimal to glassmorphism</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Zero Dependencies</h3>
                    <p>Pure HTML & CSS, no frameworks</p>
            <!-- Features -->
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <h3>Lightweight</h3>
                    <p>Under 1KB each, fast loading</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h3>Responsive</h3>
                    <p>Perfect on all devices</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <h3>9 Unique Styles</h3>
                    <p>From minimal to glassmorphism</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>Zero Dependencies</h3>
                    <p>Pure HTML & CSS, no frameworks</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">✨</div>
                    <h3>Advanced Customization</h3>
                    <p>Colors, animations, positioning</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">⚙️</div>
                    <h3>Easy Integration</h3>
                    <p>HTML embed or React component</p>
                </div>
            </div>
            <div class="badge-section">
                <div class="badge-title">
                    🎯 Minimalist Badge
                    <span style="font-size: 0.7em; background: rgba(0, 212, 255, 0.2); padding: 4px 8px; border-radius: 4px;">Most Popular</span>
                </div>
                <div class="badge-description">
                    Clean gradient design with lightning icon. Perfect for headers, footers, and navigation areas.
                </div>
                
                <div class="preview-area">
                    <a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 8px 16px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; text-decoration: none; border-radius: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3); transition: all 0.3s ease;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        Designed by StreamlineAI
                    </a>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="showTab('minimalist', 'html')">HTML</button>
                    <button class="tab" onclick="showTab('minimalist', 'react')">React</button>
                </div>
                
                <div class="code-container">
                    <div id="minimalist-html" class="tab-content active">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('minimalist-html-code')">📋 Copy</button>
                            <pre id="minimalist-html-code">&lt;a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 8px 16px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; text-decoration: none; border-radius: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3); transition: all 0.3s ease;"&gt;
    &lt;svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;"&gt;
        &lt;path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/&gt;
    &lt;/svg&gt;
    Designed by StreamlineAI
&lt;/a&gt;</pre>
                        </div>
                    </div>
                    <div id="minimalist-react" class="tab-content">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('minimalist-react-code')">📋 Copy</button>
                            <pre id="minimalist-react-code">&lt;StreamlineAIBadge style="minimalist" /&gt;</pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Badge 2: Professional -->
            <div class="badge-section">
                <div class="badge-title">💼 Professional Card</div>
                <div class="badge-description">
                    Corporate-friendly design with "Powered by" branding. Ideal for business websites and client projects.
                </div>
                
                <div class="preview-area">
                    <a href="https://stream-lineai.com" target="_blank" style="display: inline-block; padding: 12px 20px; background: white; color: #333; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; border: 1px solid #e0e0e0; box-shadow: 0 2px 12px rgba(0,0,0,0.1); transition: all 0.3s ease;">
                        <div style="display: flex; align-items: center; justify-content: center;">
                            <div style="width: 3px; height: 20px; background: linear-gradient(135deg, #00d4ff, #0099cc); border-radius: 2px; margin-right: 10px;"></div>
                            <div>
                                <div style="font-weight: 600; color: #333; margin-bottom: 2px;">Powered by</div>
                                <div style="font-weight: 700; color: #00d4ff; font-size: 15px;">StreamlineAI</div>
                            </div>
                        </div>
                    </a>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="showTab('professional', 'html')">HTML</button>
                    <button class="tab" onclick="showTab('professional', 'react')">React</button>
                </div>
                
                <div class="code-container">
                    <div id="professional-html" class="tab-content active">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('professional-html-code')">📋 Copy</button>
                            <pre id="professional-html-code">&lt;a href="https://stream-lineai.com" target="_blank" style="display: inline-block; padding: 12px 20px; background: white; color: #333; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; border: 1px solid #e0e0e0; box-shadow: 0 2px 12px rgba(0,0,0,0.1); transition: all 0.3s ease;"&gt;
    &lt;div style="display: flex; align-items: center; justify-content: center;"&gt;
        &lt;div style="width: 3px; height: 20px; background: linear-gradient(135deg, #00d4ff, #0099cc); border-radius: 2px; margin-right: 10px;"&gt;&lt;/div&gt;
        &lt;div&gt;
            &lt;div style="font-weight: 600; color: #333; margin-bottom: 2px;"&gt;Powered by&lt;/div&gt;
            &lt;div style="font-weight: 700; color: #00d4ff; font-size: 15px;"&gt;StreamlineAI&lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/a&gt;</pre>
                        </div>
                    </div>
                    <div id="professional-react" class="tab-content">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('professional-react-code')">📋 Copy</button>
                            <pre id="professional-react-code">&lt;StreamlineAIBadge style="professional" /&gt;</pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Badge 3: Corner Badge -->
            <div class="badge-section">
                <div class="badge-title">📌 Corner Badge</div>
                <div class="badge-description">
                    Fixed floating badge that appears in the bottom-right corner. Non-intrusive but always visible.
                </div>
                
                <div class="preview-area">
                    <div style="position: relative; height: 100px; background: rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                        <a href="https://stream-lineai.com" target="_blank" style="position: absolute; bottom: 10px; right: 10px; display: flex; align-items: center; padding: 8px 14px; background: rgba(0, 212, 255, 0.95); color: white; text-decoration: none; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4);">
                            <span style="margin-right: 6px;">⚡</span>
                            StreamlineAI
                        </a>
                    </div>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="showTab('corner', 'html')">HTML</button>
                    <button class="tab" onclick="showTab('corner', 'react')">React</button>
                </div>
                
                <div class="code-container">
                    <div id="corner-html" class="tab-content active">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('corner-html-code')">📋 Copy</button>
                            <pre id="corner-html-code">&lt;a href="https://stream-lineai.com" target="_blank" style="position: fixed; bottom: 20px; right: 20px; display: flex; align-items: center; padding: 8px 14px; background: rgba(0, 212, 255, 0.95); color: white; text-decoration: none; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4); z-index: 1000;"&gt;
    &lt;span style="margin-right: 6px;"&gt;⚡&lt;/span&gt;
    StreamlineAI
&lt;/a&gt;</pre>
                        </div>
                    </div>
                    <div id="corner-react" class="tab-content">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('corner-react-code')">📋 Copy</button>
                            <pre id="corner-react-code">&lt;StreamlineAIBadge style="corner" /&gt;</pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Badge 4: Dark Style -->
            <div class="badge-section">
                <div class="badge-title">
                    🌙 Dark Badge
                    <span style="font-size: 0.7em; background: rgba(0, 212, 255, 0.2); padding: 4px 8px; border-radius: 4px;">New!</span>
                </div>
                <div class="badge-description">
                    Sleek dark theme with animated pulse effect. Perfect for dark websites and modern interfaces.
                </div>
                
                <div class="preview-area">
                    <a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 10px 18px; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #00d4ff; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; border: 1px solid #333; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.3s ease;">
                        <div style="width: 8px; height: 8px; background: #00d4ff; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite;"></div>
                        Designed by StreamlineAI
                    </a>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="showTab('dark', 'html')">HTML</button>
                    <button class="tab" onclick="showTab('dark', 'react')">React</button>
                </div>
                
                <div class="code-container">
                    <div id="dark-html" class="tab-content active">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('dark-html-code')">📋 Copy</button>
                            <pre id="dark-html-code">&lt;a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 10px 18px; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: #00d4ff; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; border: 1px solid #333; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.3s ease;"&gt;
    &lt;div style="width: 8px; height: 8px; background: #00d4ff; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite;"&gt;&lt;/div&gt;
    Designed by StreamlineAI
&lt;/a&gt;</pre>
                        </div>
                    </div>
                    <div id="dark-react" class="tab-content">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('dark-react-code')">📋 Copy</button>
                            <pre id="dark-react-code">&lt;StreamlineAIBadge style="dark" /&gt;</pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Badge 5: Glassmorphism -->
            <div class="badge-section">
                <div class="badge-title">
                    ✨ Glassmorphism Badge
                    <span style="font-size: 0.7em; background: rgba(0, 212, 255, 0.2); padding: 4px 8px; border-radius: 4px;">Trendy!</span>
                </div>
                <div class="badge-description">
                    Modern glassmorphism effect with backdrop blur. Perfect for overlay designs and modern UI aesthetics.
                </div>
                
                <div class="preview-area" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 12px 24px; background: rgba(255, 255, 255, 0.15); color: white; text-decoration: none; border-radius: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Crafted by StreamlineAI
                    </a>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="showTab('glassmorphism', 'html')">HTML</button>
                    <button class="tab" onclick="showTab('glassmorphism', 'react')">React</button>
                </div>
                
                <div class="code-container">
                    <div id="glassmorphism-html" class="tab-content active">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('glassmorphism-html-code')">📋 Copy</button>
                            <pre id="glassmorphism-html-code">&lt;a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 12px 24px; background: rgba(255, 255, 255, 0.15); color: white; text-decoration: none; border-radius: 50px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;"&gt;
    &lt;svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;"&gt;
        &lt;path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/&gt;
    &lt;/svg&gt;
    Crafted by StreamlineAI
&lt;/a&gt;</pre>
                        </div>
                    </div>
                    <div id="glassmorphism-react" class="tab-content">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('glassmorphism-react-code')">📋 Copy</button>
                            <pre id="glassmorphism-react-code">&lt;StreamlineAIBadge style="glassmorphism" /&gt;</pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Badge 6: Minimal -->
            <div class="badge-section">
                <div class="badge-title">🎨 Ultra Minimal</div>
                <div class="badge-description">
                    Simple text with heart emoji. Extremely lightweight and perfect for clean, minimal designs.
                </div>
                
                <div class="preview-area">
                    <a href="https://stream-lineai.com" target="_blank" style="display: inline-block; color: #ccc; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 400; border-bottom: 1px solid transparent; transition: all 0.3s ease; opacity: 0.8;">
                        Made with ❤️ by <span style="color: #00d4ff; font-weight: 600;">StreamlineAI</span>
                    </a>
                </div>
                
                <div class="tabs">
                    <button class="tab active" onclick="showTab('minimal', 'html')">HTML</button>
                    <button class="tab" onclick="showTab('minimal', 'react')">React</button>
                </div>
                
                <div class="code-container">
                    <div id="minimal-html" class="tab-content active">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('minimal-html-code')">📋 Copy</button>
                            <pre id="minimal-html-code">&lt;a href="https://stream-lineai.com" target="_blank" style="display: inline-block; color: #666; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 400; border-bottom: 1px solid transparent; transition: all 0.3s ease; opacity: 0.8;"&gt;
    Made with ❤️ by &lt;span style="color: #00d4ff; font-weight: 600;"&gt;StreamlineAI&lt;/span&gt;
&lt;/a&gt;</pre>
                        </div>
                    </div>
                    <div id="minimal-react" class="tab-content">
                        <div class="code-block">
                            <button class="copy-btn" onclick="copyCode('minimal-react-code')">📋 Copy</button>
                            <pre id="minimal-react-code">&lt;StreamlineAIBadge style="minimal" /&gt;</pre>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- React Component Download -->
            <div class="cta">
                <h2>🚀 React Component v1.1.0</h2>
                <p>Get the complete React component with advanced customization options</p>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin: 20px 0; font-family: monospace;">
                    <code style="color: #00d4ff; font-size: 16px;">npm install streamlineai-badge</code>
                </div>
                <div style="margin: 20px 0; color: #ccc;">
                    <h4 style="color: #00d4ff; margin-bottom: 15px;">✨ New in v1.1.0:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: left;">
                        <div>• 9 Professional Styles</div>
                        <div>• Custom Colors & Animations</div>
                        <div>• Fixed Positioning System</div>
                        <div>• Size Variations</div>
                        <div>• Icon Customization</div>
                        <div>• Glassmorphism Effects</div>
                    </div>
                </div>
                <a href="/share/download/react" class="cta-btn">Download React Component</a>
                <a href="/share/download/html" class="cta-btn">Download All HTML Badges</a>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>Free to use for any StreamlineAI-powered project</p>
                <p>Questions? Contact us at <a href="mailto:support@stream-lineai.com" style="color: #00d4ff;">support@stream-lineai.com</a></p>
                <div style="margin-top: 20px;">
                    <a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: 8px 16px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: white; text-decoration: none; border-radius: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3); transition: all 0.3s ease;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        Visit StreamlineAI
                    </a>
                </div>
            </div>
        </div>
        
        <script>
            // Current badge configuration
            let currentConfig = {{
                style: 'minimalist',
                size: 'medium',
                animation: 'none',
                position: 'inline',
                fixedPosition: 'bottom-right',
                textColor: 'default',
                backgroundColor: 'default',
                borderColor: 'default'
            }};
            
            // Badge style templates
            const badgeStyles = {{
                minimalist: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: {{{{padding}}}}; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: {{{{textColor}}}}; text-decoration: none; border-radius: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 500; box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3); transition: all 0.3s ease;">
    <svg width="{{{{iconSize}}}}" height="{{{{iconSize}}}}" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
    Designed by StreamlineAI
</a>`,
                    react: `<StreamlineAIBadge style="minimalist" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }},
                professional: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-block; padding: {{{{padding}}}}; background: {{{{backgroundColor}}}}; color: {{{{textColor}}}}; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; border: 1px solid #e0e0e0; box-shadow: 0 2px 12px rgba(0,0,0,0.1); transition: all 0.3s ease;">
    <div style="display: flex; align-items: center; justify-content: center;">
        <div style="width: 2px; height: 12px; background: linear-gradient(135deg, #00d4ff, #0099cc); border-radius: 1px; margin-right: 6px;"></div>
        <div>
            <div style="font-weight: 600; margin-bottom: 1px; font-size: {{{{fontSize}}}};">Powered by</div>
            <div style="font-weight: 700; color: #00d4ff; font-size: {{{{largerFont}}}};">StreamlineAI</div>
        </div>
    </div>
</a>`,
                    react: `<StreamlineAIBadge style="professional" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }},
                glassmorphism: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: {{{{padding}}}}; background: rgba(255, 255, 255, 0.15); color: {{{{textColor}}}}; text-decoration: none; border-radius: 25px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 500; backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
    <svg width="{{{{iconSize}}}}" height="{{{{iconSize}}}}" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    Crafted by StreamlineAI
</a>`,
                    react: `<StreamlineAIBadge style="glassmorphism" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }},
                dark: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: {{{{padding}}}}; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: {{{{textColor}}}}; text-decoration: none; border-radius: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 600; border: 1px solid #333; box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.3s ease;">
    <div style="width: 6px; height: 6px; background: {{{{textColor}}}}; border-radius: 50%; margin-right: 6px;"></div>
    Designed by StreamlineAI
</a>`,
                    react: `<StreamlineAIBadge style="dark" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }},
                neon: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: {{{{padding}}}}; background: rgba(0, 0, 0, 0.8); color: {{{{textColor}}}}; text-decoration: none; border-radius: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 600; border: 2px solid #00d4ff; box-shadow: 0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(0, 212, 255, 0.1); transition: all 0.3s ease;">
    ⚡ StreamlineAI Powered
</a>`,
                    react: `<StreamlineAIBadge style="neon" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }},
                gradient: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: {{{{padding}}}}; background: linear-gradient(45deg, #00d4ff, #0099cc, #667eea, #764ba2); background-size: 300% 300%; color: {{{{textColor}}}}; text-decoration: none; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 600; animation: gradientShift 3s ease infinite; transition: all 0.3s ease; {{animation}} {{position}}">
    � StreamlineAI
</a>`,
                    react: `<StreamlineAIBadge style="gradient" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }},
                outline: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-flex; align-items: center; padding: {{{{padding}}}}; background: transparent; color: {{{{textColor}}}}; text-decoration: none; border-radius: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 600; border: 2px solid #00d4ff; transition: all 0.3s ease;">
    ✨ StreamlineAI
</a>`,
                    react: `<StreamlineAIBadge style="outline" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }},
                corner: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="position: fixed; {{{{cornerPosition}}}}; display: flex; align-items: center; padding: {{{{padding}}}}; background: rgba(0, 212, 255, 0.95); color: {{{{textColor}}}}; text-decoration: none; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 600; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 20px rgba(0, 212, 255, 0.4); z-index: 1000;">
    <span style="margin-right: 3px; font-size: {{{{iconSize}}}};">⚡</span>
    StreamlineAI
</a>`,
                    react: `<StreamlineAIBadge style="corner" size="{{{{size}}}}" animation="{{{{animation}}}}" position="fixed" fixedPosition="{{{{fixedPosition}}}}" {{{{colorProps}}}} />`
                }},
                minimal: {{
                    html: `<a href="https://stream-lineai.com" target="_blank" style="display: inline-block; color: {{{{textColor}}}}; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: {{{{fontSize}}}}; font-weight: 400; transition: all 0.3s ease; opacity: 0.8; padding: {{{{padding}}}};">
    Made with ❤️ by <span style="color: #00d4ff; font-weight: 600;">StreamlineAI</span>
</a>`,
                    react: `<StreamlineAIBadge style="minimal" size="{{{{size}}}}" animation="{{{{animation}}}}" {{{{positionProps}}}} {{{{colorProps}}}} />`
                }}
            }};
            
            // Size configurations - ultra tiny sizes
            const sizeConfig = {{
                small: {{ padding: '1px 3px', fontSize: '8px', iconSize: '9px', largerFont: '9px' }},
                medium: {{ padding: '2px 4px', fontSize: '10px', iconSize: '11px', largerFont: '11px' }},
                large: {{ padding: '3px 6px', fontSize: '12px', iconSize: '13px', largerFont: '13px' }},
                xl: {{ padding: '4px 8px', fontSize: '14px', iconSize: '15px', largerFont: '15px' }}
            }};
            
            // Animation styles
            const animationStyles = {{
                none: '',
                pulse: 'animation: pulse 2s infinite;',
                bounce: 'animation: bounce 2s infinite;',
                glow: 'animation: glow 2s ease-in-out infinite alternate;',
                float: 'animation: float 3s ease-in-out infinite;',
                shake: 'animation: shake 0.5s infinite;'
            }};
            
            function updateBadge() {{
                // Get current values
                currentConfig.style = document.getElementById('style-select').value;
                currentConfig.size = document.getElementById('size-select').value;
                currentConfig.animation = document.getElementById('animation-select').value;
                currentConfig.position = document.getElementById('position-select').value;
                currentConfig.fixedPosition = document.getElementById('fixed-position-select').value;
                currentConfig.textColor = document.getElementById('text-color-select').value;
                
                console.log('Current config:', currentConfig);
                
                // Show/hide controls based on style and position
                const fixedGroup = document.getElementById('fixed-position-group');
                const positionGroup = document.querySelector('[id*="position-select"]').closest('.control-group');
                
                if (currentConfig.style === 'corner') {{
                    // Corner badge is always fixed positioned, hide position controls
                    positionGroup.style.display = 'none';
                    fixedGroup.style.display = 'block';
                }} else {{
                    // Show position controls for other styles
                    positionGroup.style.display = 'block';
                    if (currentConfig.position === 'fixed') {{
                        fixedGroup.style.display = 'block';
                    }} else {{
                        fixedGroup.style.display = 'none';
                    }}
                }}
                
                // Generate the badge HTML
                generateBadge();
            }}
            
            function generateBadge() {{
                const style = badgeStyles[currentConfig.style];
                const size = sizeConfig[currentConfig.size];
                
                console.log('Generating badge with config:', currentConfig);
                console.log('Using size config:', size);
                
                // Color handling - fix the logic
                let textColor = currentConfig.textColor;
                if (textColor === 'default') {{
                    if (currentConfig.style === 'glassmorphism') textColor = 'white';
                    else if (currentConfig.style === 'professional') textColor = '#333';
                    else if (currentConfig.style === 'minimal') textColor = '#666';
                    else if (currentConfig.style === 'outline') textColor = '#00d4ff';
                    else if (currentConfig.style === 'neon') textColor = '#00d4ff';
                    else textColor = 'white';
                }}
                
                let backgroundColor = currentConfig.style === 'professional' ? 'white' : 'transparent';
                
                // Start with the base HTML
                let html = style.html;
                
                // Apply basic placeholder replacements first
                html = html.replace(/{{{{padding}}}}/g, size.padding);
                html = html.replace(/{{{{fontSize}}}}/g, size.fontSize);
                html = html.replace(/{{{{iconSize}}}}/g, size.iconSize);
                html = html.replace(/{{{{largerFont}}}}/g, size.largerFont);
                html = html.replace(/{{{{textColor}}}}/g, textColor);
                html = html.replace(/{{{{backgroundColor}}}}/g, backgroundColor);
                
                // Handle corner badge positioning BEFORE any style modifications
                if (currentConfig.style === 'corner') {{
                    const positions = {{
                        'top-left': 'top: 20px; left: 20px',
                        'top-right': 'top: 20px; right: 20px',
                        'bottom-left': 'bottom: 20px; left: 20px',
                        'bottom-right': 'bottom: 20px; right: 20px',
                        'center-top': 'top: 20px; left: 50%; transform: translateX(-50%)',
                        'center-bottom': 'bottom: 20px; left: 50%; transform: translateX(-50%)'
                    }};
                    const cornerPosition = positions[currentConfig.fixedPosition] || 'bottom: 20px; right: 20px';
                    
                    // Replace the placeholder first
                    html = html.replace(/{{{{cornerPosition}}}}/g, cornerPosition);
                    console.log('Corner badge - Selected position:', currentConfig.fixedPosition);
                    console.log('Corner badge - Applied CSS:', cornerPosition);
                    console.log('Corner badge - HTML after replacement:', html);
                    
                }} else if (currentConfig.position === 'fixed') {{
                    // Handle fixed positioning for non-corner badges - add positioning to existing styles
                    const positions = {{
                        'top-left': 'top: 20px !important; left: 20px !important; position: fixed !important; z-index: 1000 !important;',
                        'top-right': 'top: 20px !important; right: 20px !important; position: fixed !important; z-index: 1000 !important;',
                        'bottom-left': 'bottom: 20px !important; left: 20px !important; position: fixed !important; z-index: 1000 !important;',
                        'bottom-right': 'bottom: 20px !important; right: 20px !important; position: fixed !important; z-index: 1000 !important;',
                        'center-top': 'top: 20px !important; left: 50% !important; transform: translateX(-50%) !important; position: fixed !important; z-index: 1000 !important;',
                        'center-bottom': 'bottom: 20px !important; left: 50% !important; transform: translateX(-50%) !important; position: fixed !important; z-index: 1000 !important;'
                    }};
                    const positionStyle = positions[currentConfig.fixedPosition] || '';
                    if (positionStyle) {{
                        // Add fixed positioning to the main style attribute more aggressively
                        html = html.replace(/style="([^"]*)"/, function(match, styles) {{
                            return `style="${{styles}} ${{positionStyle}}"`;
                        }});
                        console.log('Fixed position applied:', positionStyle);
                    }}
                }}
                
                // Add animation if not gradient (gradient has built-in animation)
                if (currentConfig.animation !== 'none' && currentConfig.style !== 'gradient') {{
                    const animationStyle = animationStyles[currentConfig.animation];
                    if (animationStyle) {{
                        html = html.replace(/style="([^"]*)"/, `style="$1 ${{animationStyle}}"`);
                    }}
                }}
                
                // Apply style overrides for sizing and text color
                html = html.replace(/style="([^"]*)"/, function(match, styles) {{
                    let newStyles = styles;
                    
                    // Force padding update but preserve everything else
                    if (newStyles.includes('padding:')) {{
                        newStyles = newStyles.replace(/padding:\s*[^;]+/g, `padding: ${{size.padding}}`);
                    }}
                    
                    // Force font-size update but preserve everything else  
                    if (newStyles.includes('font-size:')) {{
                        newStyles = newStyles.replace(/font-size:\s*[^;]+/g, `font-size: ${{size.fontSize}}`);
                    }}
                    
                    // Update text color for most styles (but not gradient backgrounds that use color for text)
                    if (currentConfig.textColor !== 'default' && newStyles.includes('color:')) {{
                        // Only skip if it's a gradient that has both background and the specific gradient colors
                        const hasComplexGradient = newStyles.includes('linear-gradient') && 
                                                 (newStyles.includes('#00d4ff, #0099cc, #667eea') || 
                                                  newStyles.includes('#ff6b6b, #4ecdc4'));
                        
                        if (!hasComplexGradient) {{
                            newStyles = newStyles.replace(/color:\s*[^;]+/g, `color: ${{textColor}}`);
                        }}
                    }}
                    
                    return `style="${{newStyles}}"`;
                }});
                
                // Also update any nested elements with text color
                if (currentConfig.textColor !== 'default') {{
                    // Update nested span colors for specific styles
                    if (currentConfig.style === 'minimal') {{
                        html = html.replace(/color:\s*#00d4ff/g, `color: ${{textColor}}`);
                    }}
                    // Update professional badge's nested div colors
                    if (currentConfig.style === 'professional') {{
                        html = html.replace(/color:\s*#00d4ff;\s*font-size/g, `color: ${{textColor}}; font-size`);
                    }}
                }}
                
                console.log('Generated HTML:', html);
                
                // Generate React code
                let reactProps = [];
                if (currentConfig.animation !== 'none') reactProps.push(`animation="${{currentConfig.animation}}"`);
                if (currentConfig.position === 'fixed' || currentConfig.style === 'corner') {{
                    if (currentConfig.style !== 'corner') reactProps.push(`position="fixed"`);
                    reactProps.push(`fixedPosition="${{currentConfig.fixedPosition}}"`);
                }}
                if (currentConfig.textColor !== 'default') reactProps.push(`textColor="${{currentConfig.textColor}}"`);
                
                let positionPropsStr = reactProps.length > 0 ? ' ' + reactProps.join(' ') : '';
                
                let react = style.react
                    .replace(/{{{{size}}}}/g, currentConfig.size)
                    .replace(/{{{{animation}}}}/g, currentConfig.animation)
                    .replace(/{{{{fixedPosition}}}}/g, currentConfig.fixedPosition)
                    .replace(/{{{{positionProps}}}}/g, positionPropsStr)
                    .replace(/{{{{colorProps}}}}/g, '');
                
                // Update preview with more aggressive refresh
                const preview = document.getElementById('live-preview');
                
                // Force complete refresh by removing and recreating the element
                const previewParent = preview.parentNode;
                const newPreview = document.createElement('div');
                newPreview.id = 'live-preview';
                newPreview.className = preview.className;
                newPreview.style.cssText = preview.style.cssText;
                
                // Remove old element and add new one
                previewParent.removeChild(preview);
                previewParent.appendChild(newPreview);
                
                // Use requestAnimationFrame to ensure DOM is ready and rendering cycle is complete
                requestAnimationFrame(() => {{
                    requestAnimationFrame(() => {{
                        if ((currentConfig.position === 'fixed' && currentConfig.style !== 'corner') || currentConfig.style === 'corner') {{
                            // Show fixed positioning in a container with consistent size
                            const previewHtml = html.replace(/position:\s*fixed[^;]*;/g, 'position: absolute;');
                            const containerHTML = `<div style="position: relative; width: 100%; height: 150px; background: rgba(0,0,0,0.1); border-radius: 8px; overflow: visible; flex-shrink: 0;">
                                ${{previewHtml}}
                            </div>`;
                            console.log('Setting preview HTML (fixed position):', containerHTML);
                            newPreview.innerHTML = containerHTML;
                        }} else {{
                            console.log('Setting preview HTML (inline):', html);
                            newPreview.innerHTML = html;
                        }}
                        
                        // Force multiple reflows and style recalculations
                        newPreview.offsetHeight;
                        newPreview.scrollTop = newPreview.scrollTop;
                        document.body.offsetHeight;
                        
                        // Trigger a style recalculation by temporarily changing and reverting a property
                        const tempDisplay = newPreview.style.display;
                        newPreview.style.display = 'none';
                        newPreview.offsetHeight; // Trigger reflow
                        newPreview.style.display = tempDisplay;
                    }});
                }});
                
                // Update code displays
                document.getElementById('generated-html-code').textContent = html;
                document.getElementById('generated-react-code').textContent = react;
            }}
            
            function showGeneratedTab(type) {{
                document.querySelectorAll('#generated-html, #generated-react').forEach(el => {{
                    el.classList.remove('active');
                }});
                document.getElementById(`generated-${{type}}`).classList.add('active');
                
                document.querySelectorAll('.interactive-demo .tab').forEach(tab => {{
                    tab.classList.remove('active');
                }});
                event.target.classList.add('active');
            }}
            
            function copyGeneratedCode() {{
                const activeTab = document.querySelector('#generated-html.active, #generated-react.active');
                const code = activeTab.textContent;
                
                navigator.clipboard.writeText(code).then(() => {{
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = '✅ Copied!';
                    button.style.background = '#4CAF50';
                    
                    setTimeout(() => {{
                        button.textContent = originalText;
                        button.style.background = '#00d4ff';
                    }}, 2000);
                }}).catch(err => {{
                    console.error('Failed to copy: ', err);
                }});
            }}
            
            function showTab(badge, type) {{
                // Hide all tab contents for this badge
                const contents = document.querySelectorAll(`#${{badge}}-html, #${{badge}}-react`);
                contents.forEach(content => {{
                    content.classList.remove('active');
                }});
                
                // Remove active class from all tabs in this section
                const section = document.querySelector(`#${{badge}}-${{type}}`).closest('.badge-section');
                const tabs = section.querySelectorAll('.tab');
                tabs.forEach(tab => {{
                    tab.classList.remove('active');
                }});
                
                // Show selected content
                document.getElementById(`${{badge}}-${{type}}`).classList.add('active');
                
                // Add active class to clicked tab
                event.target.classList.add('active');
            }}
            
            function copyCode(elementId) {{
                const element = document.getElementById(elementId);
                const text = element.textContent;
                
                navigator.clipboard.writeText(text).then(() => {{
                    // Find the button that was clicked using event
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = '✅ Copied!';
                    button.style.background = '#4CAF50';
                    
                    setTimeout(() => {{
                        button.textContent = originalText;
                        button.style.background = '#00d4ff';
                    }}, 2000);
                }}).catch(err => {{
                    console.error('Failed to copy: ', err);
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    
                    const button = event.target;
                    const originalText = button.textContent;
                    button.textContent = '✅ Copied!';
                    button.style.background = '#4CAF50';
                    
                    setTimeout(() => {{
                        button.textContent = originalText;
                        button.style.background = '#00d4ff';
                    }}, 2000);
                }});
            }}
            
            // Add hover effects to badges
            document.addEventListener('DOMContentLoaded', function() {{
                const badges = document.querySelectorAll('a[href*="stream-lineai.com"]');
                badges.forEach(badge => {{
                    badge.addEventListener('mouseenter', function() {{
                        this.style.transform = 'translateY(-2px) scale(1.05)';
                    }});
                    
                    badge.addEventListener('mouseleave', function() {{
                        this.style.transform = 'translateY(0) scale(1)';
                    }});
                }});
                
                // Initialize the badge customizer
                updateBadge();
            }});
        </script>
    </body>
    </html>
    """
    
    return html_content

@router.get("/download/react")
async def download_react_component():
    """Download the React component file"""
    from fastapi.responses import FileResponse
    import os
    
    file_path = os.path.join("embed-snippets", "StreamlineAIBadge-simple.jsx")
    
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path,
            filename="StreamlineAIBadge.jsx",
            media_type="application/javascript"
        )
    else:
        raise HTTPException(status_code=404, detail="React component file not found")

@router.get("/download/html")
async def download_html_badges():
    """Download a ZIP file with all HTML badge snippets"""
    from fastapi.responses import Response
    import zipfile
    import io
    import os
    
    # Create a ZIP file in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
        # Add badge files to ZIP
        badge_files = [
            "badge-minimalist.html",
            "badge-professional.html", 
            "badge-corner.html",
            "badge-minimal.html",
            "README.md",
            "INSTALLATION.md"
        ]
        
        for filename in badge_files:
            file_path = os.path.join("embed-snippets", filename)
            if os.path.exists(file_path):
                zip_file.write(file_path, filename)
    
    zip_buffer.seek(0)
    
    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={{"Content-Disposition": "attachment; filename=streamlineai-badges.zip"}}
    )
