from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from database import get_db
from services.session_service import SessionService
from services.customer_service import CustomerService
from api.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/", response_class=HTMLResponse)
async def admin_root(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Admin root - redirect to chat logs"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>StreamlineAI Admin</title>
        <meta http-equiv="refresh" content="0; url=/admin/chat-logs">
    </head>
    <body>
        <p>Redirecting to admin panel...</p>
        <script>window.location.href='/admin/chat-logs';</script>
    </body>
    </html>
    """

@router.get("/chat-logs/{session_id}", response_class=HTMLResponse)
async def view_chat_log(session_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """View chat log for a specific session with customer info"""
    try:
        session_service = SessionService(db)
        customer_service = CustomerService(db)
        
        # Get session
        session = session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get customer info
        customer = None
        if session.customer_id:
            customer = customer_service.get_customer_by_id(session.customer_id)
        
        # Get messages
        messages = session_service.get_session_messages(session_id)
        
        # Generate HTML response
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>StreamlineAI - Chat Log {session_id}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                    color: #ffffff;
                    min-height: 100vh;
                }}
                .container {{
                    max-width: 1200px;
                    margin: 0 auto;
                    background: #1e1e1e;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 10px 30px rgba(0, 212, 255, 0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #00d4ff;
                }}
                .logo {{
                    font-size: 2.5em;
                    font-weight: bold;
                    color: #00d4ff;
                    margin-bottom: 10px;
                }}
                .session-info {{
                    background: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    border-left: 4px solid #00d4ff;
                }}
                .customer-info {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }}
                .info-card {{
                    background: #2a2a2a;
                    padding: 15px;
                    border-radius: 8px;
                    border-left: 4px solid #39ff14;
                }}
                .info-card h3 {{
                    margin: 0 0 10px 0;
                    color: #39ff14;
                    font-size: 1.1em;
                }}
                .chat-container {{
                    background: #2a2a2a;
                    border-radius: 8px;
                    padding: 20px;
                    max-height: 600px;
                    overflow-y: auto;
                }}
                .message {{
                    margin-bottom: 15px;
                    padding: 12px 15px;
                    border-radius: 8px;
                    max-width: 80%;
                }}
                .user-message {{
                    background: #00d4ff;
                    color: #000;
                    margin-left: auto;
                    border-bottom-right-radius: 4px;
                }}
                .bot-message {{
                    background: #39ff14;
                    color: #000;
                    margin-right: auto;
                    border-bottom-left-radius: 4px;
                }}
                .message-header {{
                    font-size: 0.8em;
                    opacity: 0.8;
                    margin-bottom: 5px;
                }}
                .timestamp {{
                    font-size: 0.7em;
                    opacity: 0.6;
                    margin-top: 5px;
                }}
                .stats {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                    margin-top: 30px;
                }}
                .stat-card {{
                    background: #2a2a2a;
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    border-top: 3px solid #00d4ff;
                }}
                .stat-number {{
                    font-size: 2em;
                    font-weight: bold;
                    color: #00d4ff;
                }}
                .stat-label {{
                    font-size: 0.9em;
                    opacity: 0.8;
                }}
                .no-messages {{
                    text-align: center;
                    padding: 40px;
                    color: #888;
                    font-style: italic;
                }}
                .auth-info {{
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2a2a2a;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 0.8em;
                }}
                .logout-btn {{
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-left: 10px;
                }}
            </style>
            <script>
                // Check authentication on page load
                window.addEventListener('DOMContentLoaded', function() {{
                    const token = localStorage.getItem('admin_token');
                    if (!token) {{
                        window.location.href = '/auth/login';
                        return;
                    }}
                    
                    // Validate token
                    fetch('/auth/validate', {{
                        headers: {{
                            'Authorization': 'Bearer ' + token
                        }}
                    }})
                    .then(response => {{
                        if (!response.ok) {{
                            localStorage.removeItem('admin_token');
                            window.location.href = '/auth/login';
                        }}
                    }})
                    .catch(() => {{
                        localStorage.removeItem('admin_token');
                        window.location.href = '/auth/login';
                    }});
                }});
                
                function logout() {{
                    localStorage.removeItem('admin_token');
                    window.location.href = '/auth/login';
                }}
            </script>
        </head>
        <body>
            <div class="auth-info">
                👤 Admin: {user['username']} 
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
            <div class="container">
                <div class="header">
                    <div class="logo">StreamlineAI</div>
                    <h1>Chat Log Analysis</h1>
                    <p>Session: {session_id}</p>
                </div>
                
                <div class="session-info">
                    <h2>📊 Session Information</h2>
                    <p><strong>Session ID:</strong> {session_id}</p>
                    <p><strong>Status:</strong> {session.status.title()}</p>
                    <p><strong>Created:</strong> {session.created_at.strftime('%Y-%m-%d %H:%M:%S') if session.created_at else 'Unknown'}</p>
                    <p><strong>Last Updated:</strong> {session.updated_at.strftime('%Y-%m-%d %H:%M:%S') if session.updated_at else 'Unknown'}</p>
                </div>
        """
        
        if customer:
            html_content += f"""
                <div class="customer-info">
                    <div class="info-card">
                        <h3>👤 Customer</h3>
                        <p><strong>Name:</strong> {customer.name or 'Not provided'}</p>
                        <p><strong>Email:</strong> {customer.email}</p>
                    </div>
                    <div class="info-card">
                        <h3>🏢 Business</h3>
                        <p><strong>Company:</strong> {customer.business_type or 'Not provided'}</p>
                        <p><strong>Phone:</strong> {customer.phone or 'Not provided'}</p>
                    </div>
                    <div class="info-card">
                        <h3>📈 Lead Status</h3>
                        <p><strong>Status:</strong> {customer.status.title()}</p>
                        <p><strong>Lead Date:</strong> {customer.created_at.strftime('%Y-%m-%d') if customer.created_at else 'Unknown'}</p>
                    </div>
                </div>
            """
        else:
            html_content += """
                <div class="session-info">
                    <h3>⚠️ No Customer Information</h3>
                    <p>This session doesn't have associated customer information yet.</p>
                </div>
            """
        
        html_content += """
                <div class="chat-container">
                    <h2>💬 Conversation History</h2>
        """
        
        if messages:
            total_messages = len(messages)
            user_messages = len([m for m in messages if not m.is_bot])
            bot_messages = len([m for m in messages if m.is_bot])
            
            for message in messages:
                message_class = "bot-message" if message.is_bot else "user-message"
                sender = "🤖 StreamlineAI Bot" if message.is_bot else f"👤 {customer.name if customer and customer.name else 'Customer'}"
                
                html_content += f"""
                    <div class="message {message_class}">
                        <div class="message-header">{sender}</div>
                        <div>{message.text.replace(chr(10), '<br>')}</div>
                        <div class="timestamp">{message.timestamp.strftime('%Y-%m-%d %H:%M:%S') if message.timestamp else 'Unknown time'}</div>
                    </div>
                """
            
            html_content += f"""
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number">{total_messages}</div>
                        <div class="stat-label">Total Messages</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{user_messages}</div>
                        <div class="stat-label">Customer Messages</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{bot_messages}</div>
                        <div class="stat-label">AI Responses</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{round(user_messages / max(1, total_messages) * 100)}%</div>
                        <div class="stat-label">Customer Engagement</div>
                    </div>
                </div>
            """
        else:
            html_content += """
                    <div class="no-messages">
                        <h3>No messages found</h3>
                        <p>This session doesn't have any recorded messages yet.</p>
                    </div>
                </div>
            """
        
        html_content += """
            </div>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        error_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Error - StreamlineAI Chat Log</title>
            <style>
                body {{ font-family: Arial, sans-serif; padding: 50px; background: #1a1a1a; color: white; }}
                .error {{ background: #ff4444; padding: 20px; border-radius: 8px; }}
            </style>
        </head>
        <body>
            <div class="error">
                <h1>Error Loading Chat Log</h1>
                <p>Session ID: {session_id}</p>
                <p>Error: {str(e)}</p>
            </div>
        </body>
        </html>
        """
        return error_html

@router.get("/chat-logs", response_class=HTMLResponse)
async def list_chat_logs(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """List all chat sessions with customer info"""
    try:
        session_service = SessionService(db)
        customer_service = CustomerService(db)
        
        # Get all sessions with customer info
        sessions = session_service.get_all_sessions_with_customers()
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>StreamlineAI - All Chat Logs</title>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                    color: #ffffff;
                }}
                .container {{
                    max-width: 1400px;
                    margin: 0 auto;
                    background: #1e1e1e;
                    border-radius: 10px;
                    padding: 30px;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #00d4ff;
                }}
                .logo {{
                    font-size: 2.5em;
                    font-weight: bold;
                    color: #00d4ff;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    background: #2a2a2a;
                    border-radius: 8px;
                    overflow: hidden;
                }}
                th, td {{
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #444;
                }}
                th {{
                    background: #00d4ff;
                    color: #000;
                    font-weight: bold;
                }}
                tr:hover {{
                    background: #333;
                }}
                .session-link {{
                    color: #39ff14;
                    text-decoration: none;
                    font-weight: bold;
                }}
                .session-link:hover {{
                    text-decoration: underline;
                }}
                .status {{
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                }}
                .status-active {{ background: #39ff14; color: #000; }}
                .status-completed {{ background: #00d4ff; color: #000; }}
                .status-proposal_sent {{ background: #ffa500; color: #000; }}
                .auth-info {{
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2a2a2a;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 0.8em;
                }}
                .logout-btn {{
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-left: 10px;
                }}
            </style>
            <script>
                // Check authentication on page load
                window.addEventListener('DOMContentLoaded', function() {{
                    const token = localStorage.getItem('admin_token');
                    if (!token) {{
                        window.location.href = '/auth/login';
                        return;
                    }}
                    
                    // Validate token
                    fetch('/auth/validate', {{
                        headers: {{
                            'Authorization': 'Bearer ' + token
                        }}
                    }})
                    .then(response => {{
                        if (!response.ok) {{
                            localStorage.removeItem('admin_token');
                            window.location.href = '/auth/login';
                        }}
                    }})
                    .catch(() => {{
                        localStorage.removeItem('admin_token');
                        window.location.href = '/auth/login';
                    }});
                }});
                
                function logout() {{
                    localStorage.removeItem('admin_token');
                    window.location.href = '/auth/login';
                }}
            </script>
            </style>
        </head>
        <body>
            <div class="auth-info">
                👤 Admin: {user['username']} 
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
            <div class="container">
                <div class="header">
                    <div class="logo">StreamlineAI</div>
                    <h1>All Chat Sessions</h1>
                    <p>Sales Team Dashboard</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Session ID</th>
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Messages</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        """
        
        if sessions:
            for session, customer, message_count in sessions:
                status_class = f"status-{session.status.replace(' ', '_')}"
                customer_name = customer.name if customer and customer.name else "Unknown"
                customer_email = customer.email if customer else "No email"
                customer_company = customer.business_type if customer and customer.business_type else "Unknown"
                
                html_content += f"""
                        <tr>
                            <td><code>{session.session_id[:8]}...</code></td>
                            <td>{customer_name}</td>
                            <td>{customer_email}</td>
                            <td>{customer_company}</td>
                            <td><span class="status {status_class}">{session.status.title()}</span></td>
                            <td>{session.created_at.strftime('%Y-%m-%d %H:%M') if session.created_at else 'Unknown'}</td>
                            <td>{message_count or 0}</td>
                            <td><a href="/admin/chat-logs/{session.session_id}" class="session-link">View Chat</a></td>
                        </tr>
                """
        else:
            html_content += """
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 40px; color: #888;">
                                No chat sessions found
                            </td>
                        </tr>
            """
        
        html_content += """
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        return f"<html><body><h1>Error</h1><p>{str(e)}</p></body></html>"

@router.get("/admins", response_class=HTMLResponse)
async def admin_management_page(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Admin management page (super admin only)"""
    if not user.get('is_super_admin', False):
        return """
        <html><body style="font-family: Arial; padding: 50px; background: #1a1a1a; color: white; text-align: center;">
            <h1>Access Denied</h1>
            <p>Only super administrators can access this page.</p>
            <a href="/admin/chat-logs" style="color: #00d4ff;">← Back to Chat Logs</a>
        </body></html>
        """
    
    try:
        from services.admin_service import AdminService
        admin_service = AdminService(db)
        admins = admin_service.get_all_admins()
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>StreamlineAI - Admin Management</title>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                    color: #ffffff;
                }}
                .container {{
                    max-width: 1200px;
                    margin: 0 auto;
                    background: #1e1e1e;
                    border-radius: 10px;
                    padding: 30px;
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #00d4ff;
                }}
                .logo {{
                    font-size: 2.5em;
                    font-weight: bold;
                    color: #00d4ff;
                }}
                .auth-info {{
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #2a2a2a;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 0.8em;
                }}
                .logout-btn {{
                    background: #ff4444;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-left: 10px;
                }}
                .nav-links {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .nav-links a {{
                    color: #00d4ff;
                    text-decoration: none;
                    margin: 0 15px;
                    padding: 10px 20px;
                    border: 1px solid #00d4ff;
                    border-radius: 5px;
                    transition: all 0.3s;
                }}
                .nav-links a:hover {{
                    background: #00d4ff;
                    color: #000;
                }}
                .create-admin-form {{
                    background: #2a2a2a;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    border-left: 4px solid #39ff14;
                }}
                .form-group {{
                    margin-bottom: 15px;
                }}
                .form-group label {{
                    display: block;
                    margin-bottom: 5px;
                    color: #ccc;
                }}
                .form-group input {{
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #444;
                    border-radius: 4px;
                    background: #1a1a1a;
                    color: #fff;
                    box-sizing: border-box;
                }}
                .btn {{
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                }}
                .btn-primary {{
                    background: #00d4ff;
                    color: #000;
                }}
                .btn-danger {{
                    background: #ff4444;
                    color: #fff;
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                    background: #2a2a2a;
                    border-radius: 8px;
                    overflow: hidden;
                }}
                th, td {{
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid #444;
                }}
                th {{
                    background: #00d4ff;
                    color: #000;
                    font-weight: bold;
                }}
                tr:hover {{
                    background: #333;
                }}
                .status-badge {{
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    font-weight: bold;
                }}
                .status-active {{
                    background: #39ff14;
                    color: #000;
                }}
                .status-inactive {{
                    background: #ff4444;
                    color: #fff;
                }}
                .super-admin {{
                    background: #ffa500;
                    color: #000;
                }}
                .message {{
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 20px;
                    display: none;
                }}
                .message.success {{
                    background: #39ff14;
                    color: #000;
                }}
                .message.error {{
                    background: #ff4444;
                    color: #fff;
                }}
            </style>
            <script>
                // Check authentication on page load
                window.addEventListener('DOMContentLoaded', function() {{
                    const token = localStorage.getItem('admin_token');
                    if (!token) {{
                        window.location.href = '/auth/login';
                        return;
                    }}
                    
                    // Validate token
                    fetch('/auth/validate', {{
                        headers: {{
                            'Authorization': 'Bearer ' + token
                        }}
                    }})
                    .then(response => {{
                        if (!response.ok) {{
                            localStorage.removeItem('admin_token');
                            window.location.href = '/auth/login';
                        }}
                    }})
                    .catch(() => {{
                        localStorage.removeItem('admin_token');
                        window.location.href = '/auth/login';
                    }});
                }});
                
                function logout() {{
                    localStorage.removeItem('admin_token');
                    window.location.href = '/auth/login';
                }}
                
                function showMessage(text, type) {{
                    const message = document.getElementById('message');
                    message.textContent = text;
                    message.className = 'message ' + type;
                    message.style.display = 'block';
                    setTimeout(() => {{
                        message.style.display = 'none';
                    }}, 5000);
                }}
                
                async function createAdmin(event) {{
                    event.preventDefault();
                    
                    const token = localStorage.getItem('admin_token');
                    const formData = new FormData(event.target);
                    
                    const data = {{
                        email: formData.get('email'),
                        username: formData.get('username'),
                        password: formData.get('password'),
                        full_name: formData.get('full_name')
                    }};
                    
                    try {{
                        const response = await fetch('/auth/create-admin', {{
                            method: 'POST',
                            headers: {{
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            }},
                            body: JSON.stringify(data)
                        }});
                        
                        const result = await response.json();
                        
                        if (response.ok) {{
                            showMessage('Admin created successfully!', 'success');
                            event.target.reset();
                            setTimeout(() => location.reload(), 2000);
                        }} else {{
                            showMessage(result.detail || 'Error creating admin', 'error');
                        }}
                    }} catch (error) {{
                        showMessage('Network error: ' + error.message, 'error');
                    }}
                }}
                
                async function deleteAdmin(adminId) {{
                    if (!confirm('Are you sure you want to deactivate this admin?')) {{
                        return;
                    }}
                    
                    const token = localStorage.getItem('admin_token');
                    
                    try {{
                        const response = await fetch(`/auth/admins/${{adminId}}`, {{
                            method: 'DELETE',
                            headers: {{
                                'Authorization': 'Bearer ' + token
                            }}
                        }});
                        
                        const result = await response.json();
                        
                        if (response.ok) {{
                            showMessage('Admin deactivated successfully', 'success');
                            setTimeout(() => location.reload(), 2000);
                        }} else {{
                            showMessage(result.detail || 'Error deactivating admin', 'error');
                        }}
                    }} catch (error) {{
                        showMessage('Network error: ' + error.message, 'error');
                    }}
                }}
            </script>
        </head>
        <body>
            <div class="auth-info">
                👤 Admin: {user['username']} 
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
            <div class="container">
                <div class="header">
                    <div class="logo">StreamlineAI</div>
                    <h1>Admin Management</h1>
                    <p>Super Admin Portal</p>
                </div>
                
                <div class="nav-links">
                    <a href="/admin/chat-logs">Chat Logs</a>
                    <a href="/admin/admins">Admin Management</a>
                </div>
                
                <div id="message" class="message"></div>
                
                <div class="create-admin-form">
                    <h3>Create New Admin</h3>
                    <form onsubmit="createAdmin(event)">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label>Username</label>
                                <input type="text" name="username" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" name="password" required minlength="8">
                            </div>
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" name="full_name">
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Create Admin</button>
                    </form>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        """
        
        for admin in admins:
            admin_type = "Super Admin" if admin.is_super_admin else "Admin"
            admin_type_class = "super-admin" if admin.is_super_admin else "status-active"
            status_class = "status-active" if admin.is_active else "status-inactive"
            status_text = "Active" if admin.is_active else "Inactive"
            last_login = admin.last_login.strftime('%Y-%m-%d %H:%M') if admin.last_login else 'Never'
            
            delete_btn = ""
            if not admin.is_super_admin:
                delete_btn = f'<button class="btn btn-danger" onclick="deleteAdmin({admin.id})" style="font-size: 0.8em; padding: 5px 10px;">Deactivate</button>'
            
            html_content += f"""
                        <tr>
                            <td>{admin.id}</td>
                            <td>{admin.email}</td>
                            <td>{admin.username}</td>
                            <td>{admin.full_name or 'N/A'}</td>
                            <td><span class="status-badge {admin_type_class}">{admin_type}</span></td>
                            <td><span class="status-badge {status_class}">{status_text}</span></td>
                            <td>{last_login}</td>
                            <td>{delete_btn}</td>
                        </tr>
            """
        
        html_content += """
                    </tbody>
                </table>
            </div>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        error_html = f"""
        <html><body style="font-family: Arial; padding: 50px; background: #1a1a1a; color: white;">
            <h1>Error Loading Admin Management</h1>
            <p>Error: {str(e)}</p>
        </body></html>
        """
        return error_html
