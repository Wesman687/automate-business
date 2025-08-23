// Updated embedded-auth.js - more aggressive styling
(function() {
  'use strict';
  
  console.log('🔧 Embedded auth script loading...');
  
  // Check if we're embedded
  const isEmbedded = window.parent !== window.self || 
                    new URLSearchParams(window.location.search).get('embedded') === 'true';

  if (isEmbedded) {
    console.log('✅ Embedded mode detected');
    document.body.classList.add('embedded');
    
    // More aggressive styling that will override everything
    const style = document.createElement('style');
    style.textContent = `
      /* Force hide navigation and unwanted elements */
      body.embedded nav,
      body.embedded header,
      body.embedded footer,
      body.embedded .navbar,
      body.embedded .sidebar,
      body.embedded .particle-background,
      body.embedded .chatbot,
      body.embedded *[class*="chat"],
      body.embedded *[class*="particle"],
      body.embedded *[class*="nav"] {
        display: none !important;
      }
      
      /* Force body styling */
      body.embedded {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
        color: white !important;
        font-family: system-ui, sans-serif !important;
        margin: 0 !important;
        padding: 20px !important;
        min-height: 100vh !important;
      }
      
      /* Force container styling */
      body.embedded .login-container,
      body.embedded .auth-form,
      body.embedded .login-form,
      body.embedded form,
      body.embedded div[class*="container"],
      body.embedded div[class*="form"] {
        background: rgba(30, 41, 59, 0.8) !important;
        border: 1px solid #334155 !important;
        border-radius: 12px !important;
        padding: 30px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        backdrop-filter: blur(10px) !important;
        max-width: 100% !important;
        margin: 0 !important;
        color: white !important;
      }
      
      /* Force input styling */
      body.embedded input {
        background: #374151 !important;
        border: 1px solid #4b5563 !important;
        color: white !important;
        padding: 14px !important;
        border-radius: 8px !important;
        width: 100% !important;
        margin-bottom: 16px !important;
        font-size: 16px !important;
        box-sizing: border-box !important;
      }
      
      body.embedded input:focus {
        outline: none !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
      
      /* Force button styling */
      body.embedded button,
      body.embedded input[type="submit"],
      body.embedded .btn,
      body.embedded *[class*="button"] {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
        border: none !important;
        color: white !important;
        padding: 14px 28px !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 16px !important;
        cursor: pointer !important;
        width: 100% !important;
        transition: all 0.2s !important;
      }
      
      body.embedded button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
      }
      
      /* Force text styling */
      body.embedded h1,
      body.embedded h2,
      body.embedded h3,
      body.embedded p,
      body.embedded span,
      body.embedded label,
      body.embedded *[class*="title"],
      body.embedded *[class*="text"] {
        color: #f1f5f9 !important;
        text-align: center !important;
        margin-bottom: 16px !important;
      }
      
      /* Ensure form elements are visible and properly styled */
      body.embedded form,
      body.embedded form *,
      body.embedded input,
      body.embedded button,
      body.embedded label,
      body.embedded h1,
      body.embedded h2,
      body.embedded h3,
      body.embedded p,
      body.embedded span,
      body.embedded div {
        display: block !important;
        visibility: visible !important;
      }
      
      /* Force main container to take full width */
      body.embedded > div,
      body.embedded main,
      body.embedded *[class*="container"] {
        max-width: 100% !important;
        width: 100% !important;
        height: auto !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 20px !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('🎨 Embedded styling applied');
    
    // Rest of your auth detection code...
    let hasAuthCookie = document.cookie.includes('auth_token') || 
                       document.cookie.includes('admin_token') || 
                       document.cookie.includes('customer_token');
    
    const checkAuthStatus = () => {
      const nowHasAuth = document.cookie.includes('auth_token') || 
                        document.cookie.includes('admin_token') || 
                        document.cookie.includes('customer_token');
      
      if (nowHasAuth && !hasAuthCookie) {
        hasAuthCookie = true;
        
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'AUTH_SUCCESS',
            timestamp: Date.now()
          }, '*');
          console.log('✅ Auth success message sent to parent');
        }
      }
    };
    
    const authCheckInterval = setInterval(checkAuthStatus, 500);
    
    window.addEventListener('beforeunload', () => {
      clearInterval(authCheckInterval);
    });
  } else {
    console.log('❌ Not in embedded mode');
  }
})();
