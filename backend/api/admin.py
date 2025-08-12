from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from database import get_db
from services.session_service import SessionService
from services.customer_service import CustomerService
from api.auth import get_current_user, get_current_user_or_redirect
from api.schedule import router as schedule_router
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])
router.include_router(schedule_router)

@router.get("/", response_class=HTMLResponse)
async def admin_root(request: Request, db: Session = Depends(get_db)):
    """Admin root - redirect to new React admin frontend"""
    from fastapi.responses import RedirectResponse
    
    # Check authentication
    token = request.cookies.get('admin_token')
    if not token:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    # Validate token
    from services.auth_service import auth_service
    user_info = auth_service.validate_token(token)
    if not user_info:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    # Redirect to new React admin frontend
    return RedirectResponse(url="http://localhost:3000/admin", status_code=302)

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
                .nav {{
                    display: flex;
                    gap: 20px;
                    background: rgba(0, 212, 255, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    justify-content: center;
                }}
                
                .nav a {{
                    color: #ffffff;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                    font-weight: 500;
                }}
                
                .nav a:hover {{
                    background: rgba(0, 212, 255, 0.3);
                    transform: translateY(-2px);
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
                function logout() {{
                    window.location.href = '/auth/logout';
                }}
            </script>
        </head>
        <body>
            <div class="auth-info">
                👤 Admin: {user['email']} 
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
            <div class="container">
                <div class="header">
                    <div class="logo">StreamlineAI</div>
                    <h1>Chat Log Analysis</h1>
                    <p>Session: {session_id}</p>
                </div>
                
                <div class="nav">
                    <strong style="color: white; padding: 10px 20px; background: rgba(0, 212, 255, 0.3); border-radius: 6px;">Chat Logs</strong>
                    <a href="/admin/customers">Customers</a>
                    <a href="/admin/schedule">Schedule</a>
                    <a href="/admin/admins">Admin Users</a>
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
async def list_chat_logs(request: Request, db: Session = Depends(get_db)):
    """List all chat sessions with customer info"""
    from fastapi.responses import RedirectResponse
    from services.auth_service import auth_service
    from services.admin_service import AdminService
    
    # Check authentication
    token = request.cookies.get('admin_token')
    if not token:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    # Validate token
    user_info = auth_service.validate_token(token)
    if not user_info:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    # Get admin details
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_id(user_info['admin_id'])
    if not admin or not admin.is_active:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    user = {
        'username': admin.username,
        'is_super_admin': admin.is_super_admin,
        'email': admin.email
    }
    
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
                function logout() {{
                    // Redirect to logout endpoint which will clear the cookie
                    window.location.href = '/auth/logout';
                }}
            </script>
        </head>
        <body>
            <div class="auth-info">
                👤 Admin: {user['email']} 
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
            <div class="container">
                <div class="header">
                    <div class="logo">StreamlineAI</div>
                    <h1>All Chat Sessions</h1>
                    <p>Sales Team Dashboard</p>
                </div>
                
                <div class="nav">
                    <strong style="color: white; padding: 10px 20px; background: rgba(0, 212, 255, 0.3); border-radius: 6px;">Chat Logs</strong>
                    <a href="/admin/customers">Customers</a>
                    <a href="/admin/schedule">Schedule</a>
                    {f'<a href="/admin/admins">Admin Users</a>' if user.get('is_super_admin', False) else ''}
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
                            <th>Actions</th>
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
                            <td>
                                {f'<a href="/admin/customers/{customer.id}" style="color: #00d4ff; text-decoration: none;">{customer_email}</a>' if customer and customer.id else customer_email}
                            </td>
                            <td>{customer_company}</td>
                            <td><span class="status {status_class}">{session.status.title()}</span></td>
                            <td>{session.created_at.strftime('%Y-%m-%d %H:%M') if session.created_at else 'Unknown'}</td>
                            <td>{message_count or 0}</td>
                            <td>
                                <a href="/admin/chat-logs/{session.session_id}" class="session-link" style="margin-right: 10px;">View Chat</a>
                                <button onclick="deleteChat('{session.session_id}')" 
                                        style="background: #ff6b6b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                    Delete
                                </button>
                            </td>
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
            
            <script>
                function deleteChat(sessionId) {
                    if (confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
                        fetch(`/admin/chat-logs/${sessionId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            if (response.ok) {
                                location.reload();
                            } else {
                                alert('Error deleting chat session');
                            }
                        });
                    }
                }
                
                function logout() {
                    window.location.href = '/auth/logout';
                }
            </script>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        return f"<html><body><h1>Error</h1><p>{str(e)}</p></body></html>"

@router.get("/admins", response_class=HTMLResponse)
async def admin_management_page(request: Request, db: Session = Depends(get_db)):
    """Admin management page (super admin only)"""
    from fastapi.responses import RedirectResponse
    from services.auth_service import auth_service
    from services.admin_service import AdminService
    
    # Check authentication
    token = request.cookies.get('admin_token')
    if not token:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    # Validate token
    user_info = auth_service.validate_token(token)
    if not user_info:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    # Get admin details
    admin_service = AdminService(db)
    admin = admin_service.get_admin_by_id(user_info['admin_id'])
    if not admin or not admin.is_active:
        return RedirectResponse(url="/auth/login", status_code=302)
    
    user = {
        'username': admin.username,
        'is_super_admin': admin.is_super_admin,
        'email': admin.email
    }
    
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
                .nav {{ 
                    background: rgba(0, 212, 255, 0.1); 
                    padding: 20px; 
                    border-radius: 15px; 
                    margin-bottom: 30px;
                    text-align: center;
                }}
                .nav a {{ 
                    color: #00d4ff; 
                    text-decoration: none; 
                    margin: 0 20px;
                    padding: 10px 20px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }}
                .nav a:hover {{ background: rgba(0, 212, 255, 0.2); }}
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
                    background: #ffffff;
                    color: #000;
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
                function logout() {{
                    window.location.href = '/auth/logout';
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
                    
                    const formData = new FormData(event.target);
                    
                    const data = {{
                        email: formData.get('email'),
                        password: formData.get('password'),
                        full_name: formData.get('full_name')
                    }};
                    
                    try {{
                        const response = await fetch('/auth/create-admin', {{
                            method: 'POST',
                            headers: {{
                                'Content-Type': 'application/json'
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
                    
                    try {{
                        const response = await fetch(`/auth/admins/${{adminId}}`, {{
                            method: 'DELETE'
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
                
                async function makeSuperAdmin(adminId) {{
                    if (!confirm('Are you sure you want to make this admin a super admin? This will give them full administrative privileges.')) {{
                        return;
                    }}
                    
                    try {{
                        const response = await fetch(`/auth/admins/${{adminId}}/make-super-admin`, {{
                            method: 'POST'
                        }});
                        
                        const result = await response.json();
                        
                        if (response.ok) {{
                            showMessage('Admin promoted to super admin successfully!', 'success');
                            setTimeout(() => location.reload(), 2000);
                        }} else {{
                            showMessage(result.detail || 'Error promoting admin', 'error');
                        }}
                    }} catch (error) {{
                        showMessage('Network error: ' + error.message, 'error');
                    }}
                }}
                
                async function removeSuperAdmin(adminId) {{
                    if (!confirm('Are you sure you want to remove super admin status from this admin?')) {{
                        return;
                    }}
                    
                    try {{
                        const response = await fetch(`/auth/admins/${{adminId}}/remove-super-admin`, {{
                            method: 'POST'
                        }});
                        
                        const result = await response.json();
                        
                        if (response.ok) {{
                            showMessage('Super admin status removed successfully!', 'success');
                            setTimeout(() => location.reload(), 2000);
                        }} else {{
                            showMessage(result.detail || 'Error removing super admin status', 'error');
                        }}
                    }} catch (error) {{
                        showMessage('Network error: ' + error.message, 'error');
                    }}
                }}
                
                function editAdmin(adminId, email, fullName) {{
                    const newEmail = prompt('Edit Email:', email);
                    const newFullName = prompt('Edit Full Name:', fullName);
                    
                    if (newEmail !== null && newFullName !== null) {{
                        updateAdmin(adminId, {{ email: newEmail, full_name: newFullName }});
                    }}
                }}
                
                async function updateAdmin(adminId, updateData) {{
                    try {{
                        const response = await fetch(`/auth/admins/${{adminId}}`, {{
                            method: 'PUT',
                            headers: {{
                                'Content-Type': 'application/json'
                            }},
                            body: JSON.stringify(updateData)
                        }});
                        
                        const result = await response.json();
                        
                        if (response.ok) {{
                            showMessage('Admin updated successfully!', 'success');
                            setTimeout(() => location.reload(), 2000);
                        }} else {{
                            showMessage(result.detail || 'Error updating admin', 'error');
                        }}
                    }} catch (error) {{
                        showMessage('Network error: ' + error.message, 'error');
                    }}
                }}
            </script>
        </head>
        <body>
            <div class="auth-info">
                👤 Admin: {user['email']} 
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
            <div class="container">
                <div class="header">
                    <div class="logo">StreamlineAI</div>
                    <h1>Admin Management</h1>
                    <p>Super Admin Portal</p>
                </div>
                
                <div class="nav">
                    <a href="/admin/chat-logs">Chat Logs</a>
                    <a href="/admin/customers">Customers</a>
                    <a href="/admin/schedule">Schedule</a>
                    <strong style="color: white; padding: 10px 20px; background: rgba(0, 212, 255, 0.3); border-radius: 6px;">Admin Users</strong>
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
            
            # Build action buttons
            actions = []
            
            # Edit button (for self or super admins)
            if user.get('is_super_admin') or user.get('admin_id') == admin.id:
                full_name_escaped = (admin.full_name or '').replace("'", "\\'")
                edit_btn = f'<button class="btn btn-primary" onclick="editAdmin({admin.id}, \'{admin.email}\', \'{full_name_escaped}\')" '
                edit_btn += 'style="font-size: 0.8em; padding: 5px 10px; margin-right: 5px; background: #00d4ff;">Edit</button>'
                actions.append(edit_btn)
            
            # Delete button (super admin only, not for super admins)
            if user.get('is_super_admin') and not admin.is_super_admin:
                actions.append(f'<button class="btn btn-danger" onclick="deleteAdmin({admin.id})" style="font-size: 0.8em; padding: 5px 10px; margin-right: 5px;">Deactivate</button>')
            
            # Make super admin button (super admin only, not for super admins)
            if user.get('is_super_admin') and not admin.is_super_admin:
                actions.append(f'<button class="btn btn-primary" onclick="makeSuperAdmin({admin.id})" style="font-size: 0.8em; padding: 5px 10px; margin-right: 5px; background: #ffa500;">Make Super Admin</button>')
            
            # Remove super admin button (owner only, for super admins except owner)
            if user.get('email', '').lower() == 'wesman687@gmail.com' and admin.is_super_admin and admin.email.lower() != 'wesman687@gmail.com':
                actions.append(f'<button class="btn btn-danger" onclick="removeSuperAdmin({admin.id})" style="font-size: 0.8em; padding: 5px 10px; margin-right: 5px; background: #ff6600;">Remove Super Admin</button>')
            
            actions_html = ''.join(actions)
            
            html_content += f"""
                        <tr>
                            <td>{admin.id}</td>
                            <td>{admin.email}</td>
                            <td>{admin.full_name or 'N/A'}</td>
                            <td><span class="status-badge {admin_type_class}">{admin_type}</span></td>
                            <td><span class="status-badge {status_class}">{status_text}</span></td>
                            <td>{last_login}</td>
                            <td>{actions_html}</td>
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

# Customer Management Routes
@router.get("/customers", response_class=HTMLResponse)
async def customers_page(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Customer management page"""
    try:
        customer_service = CustomerService(db)
        customers = customer_service.get_all_customers()
        
        customers_html = ""
        for customer in customers:
            # Parse additional websites
            additional_sites = ""
            if customer.additional_websites:
                import json
                try:
                    sites = json.loads(customer.additional_websites)
                    additional_sites = ", ".join([f'<a href="{site}" target="_blank">{site}</a>' for site in sites])
                except:
                    additional_sites = customer.additional_websites
            
            # Get chat count
            chat_count = len(customer.chat_sessions) if customer.chat_sessions else 0
            
            customers_html += f"""
            <tr style="background: rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer;" onclick="viewCustomer({customer.id})">
                <td style="padding: 12px; border-right: 1px solid rgba(255, 255, 255, 0.1);">
                    <div style="font-weight: 600; color: #00d4ff;">
                        {customer.name or 'N/A'}
                    </div>
                    <div style="font-size: 0.8em; color: #ccc; margin-top: 4px;">ID: {customer.id}</div>
                </td>
                <td style="padding: 12px; border-right: 1px solid rgba(255, 255, 255, 0.1);">
                    <div>{customer.email}</div>
                    <div style="font-size: 0.8em; color: #aaa; margin-top: 2px;">{customer.phone or 'No phone'}</div>
                </td>
                <td style="padding: 12px; border-right: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.9em; max-width: 200px;">
                    {customer.address or 'No address'}
                </td>
                <td style="padding: 12px; border-right: 1px solid rgba(255, 255, 255, 0.1);">
                    <div>
                        {f'<a href="{customer.business_site}" target="_blank" style="color: #00d4ff;">{customer.business_site}</a>' if customer.business_site else 'No website'}
                    </div>
                    {f'<div style="font-size: 0.8em; margin-top: 4px;">{additional_sites}</div>' if additional_sites else ''}
                </td>
                <td style="padding: 12px; border-right: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
                    <span style="color: #00d4ff; font-weight: 600; cursor: pointer;" onclick="viewCustomerChats({customer.id})">
                        {chat_count} chats
                    </span>
                </td>
                <td style="padding: 12px; border-right: 1px solid rgba(255, 255, 255, 0.1);">
                    <span style="background: {'#00d4ff' if customer.status == 'customer' else '#ff6b6b' if customer.status == 'lead' else '#ffa500'}; 
                          color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em;">
                        {customer.status}
                    </span>
                </td>
                <td style="padding: 12px; font-size: 0.8em; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                    {customer.notes[:100] + '...' if customer.notes and len(customer.notes) > 100 else customer.notes or 'No notes'}
                </td>
                <td style="padding: 12px;">
                    <button onclick="event.stopPropagation(); editCustomer({customer.id})" 
                            style="background: #00d4ff; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                        Edit
                    </button>
                    <button onclick="event.stopPropagation(); deleteCustomer({customer.id})" 
                            style="background: #ff6b6b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                        Delete
                    </button>
                </td>
            </tr>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>StreamlineAI Admin - Customers</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                    color: white;
                    min-height: 100vh;
                }}
                .header {{
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 20px 40px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }}
                .nav {{ 
                    background: rgba(0, 212, 255, 0.1); 
                    padding: 20px; 
                    border-radius: 15px; 
                    margin-bottom: 30px;
                    text-align: center;
                }}
                .nav a {{ 
                    color: #00d4ff; 
                    text-decoration: none; 
                    margin: 0 20px;
                    padding: 10px 20px;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }}
                .nav a:hover {{ background: rgba(0, 212, 255, 0.2); }}
                .container {{
                    padding: 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                }}
                .stats-grid {{
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }}
                .stat-card {{
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }}
                .table-container {{
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                th {{
                    background: rgba(0, 212, 255, 0.2);
                    color: #00d4ff;
                    padding: 15px 12px;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="margin: 0; color: #00d4ff; font-size: 28px;">
                    ⚡ StreamlineAI Admin
                </h1>
                <div class="nav">
                    <a href="/admin/chat-logs">Chat Logs</a>
                    <strong style="color: white; padding: 10px 20px; background: rgba(0, 212, 255, 0.3); border-radius: 6px;">Customers</strong>
                    <a href="/admin/schedule">Schedule</a>
                    <a href="/admin/admins">Admin Users</a>
                    <a href="/auth/logout" style="margin-left: auto; color: #ff6b6b;">Logout</a>
                </div>
            </div>
            
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="margin: 0; color: #00d4ff;">Customer Management</h2>
                    <button onclick="addCustomer()" 
                            style="background: #00d4ff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        + Add Customer
                    </button>
                </div>
                
                <style>
                    tbody tr:hover {{
                        background: rgba(0, 212, 255, 0.1) !important;
                        transform: translateY(-1px);
                        transition: all 0.2s ease;
                    }}
                </style>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3 style="margin: 0 0 10px 0; color: #00d4ff;">Total Customers</h3>
                        <div style="font-size: 24px; font-weight: 600;">{len(customers)}</div>
                    </div>
                    <div class="stat-card">
                        <h3 style="margin: 0 0 10px 0; color: #00d4ff;">Active Leads</h3>
                        <div style="font-size: 24px; font-weight: 600;">{len([c for c in customers if c.status == 'lead'])}</div>
                    </div>
                    <div class="stat-card">
                        <h3 style="margin: 0 0 10px 0; color: #00d4ff;">Paying Customers</h3>
                        <div style="font-size: 24px; font-weight: 600;">{len([c for c in customers if c.status == 'customer'])}</div>
                    </div>
                    <div class="stat-card">
                        <h3 style="margin: 0 0 10px 0; color: #00d4ff;">Total Chats</h3>
                        <div style="font-size: 24px; font-weight: 600;">{sum(len(c.chat_sessions) for c in customers if c.chat_sessions)}</div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contact</th>
                                <th>Address</th>
                                <th>Websites</th>
                                <th>Chats</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers_html}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <script>
                function viewCustomer(customerId) {{
                    window.location.href = `/admin/customers/${{customerId}}`;
                }}
                
                function viewCustomerChats(customerId) {{
                    window.location.href = `/admin/customers/${{customerId}}/chats`;
                }}
                
                function editCustomer(customerId) {{
                    // Navigate to customer detail page where full edit functionality is available
                    window.location.href = `/admin/customers/${{customerId}}`;
                }}
                
                function deleteCustomer(customerId) {{
                    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {{
                        fetch(`/admin/customers/${{customerId}}`, {{
                            method: 'DELETE',
                            headers: {{
                                'Content-Type': 'application/json'
                            }}
                        }})
                        .then(response => {{
                            if (response.ok) {{
                                location.reload();
                            }} else {{
                                alert('Error deleting customer');
                            }}
                        }});
                    }}
                }}
                
                function addCustomer() {{
                    const modalHtml = `
                        <div id="addModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                            <div style="background: #2a2a2a; padding: 30px; border-radius: 12px; width: 500px; max-height: 80vh; overflow-y: auto;">
                                <h3 style="margin-top: 0; color: #00d4ff;">Add New Customer</h3>
                                <form id="addForm">
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Name *</label>
                                        <input type="text" id="addName" required style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Email *</label>
                                        <input type="email" id="addEmail" required style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Phone</label>
                                        <input type="text" id="addPhone" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Company</label>
                                        <input type="text" id="addCompany" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                                        <button type="button" onclick="closeAddModal()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
                                        <button type="submit" style="background: #00d4ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Add Customer</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;
                    
                    document.body.insertAdjacentHTML('beforeend', modalHtml);
                    
                    document.getElementById('addForm').onsubmit = function(e) {{
                        e.preventDefault();
                        saveNewCustomer();
                    }};
                }}
                
                function closeAddModal() {{
                    const modal = document.getElementById('addModal');
                    if (modal) modal.remove();
                }}
                
                function saveNewCustomer() {{
                    const formData = {{
                        name: document.getElementById('addName').value,
                        email: document.getElementById('addEmail').value,
                        phone: document.getElementById('addPhone').value,
                        company: document.getElementById('addCompany').value
                    }};
                    
                    fetch('/api/customers', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json'
                        }},
                        body: JSON.stringify(formData)
                    }})
                    .then(response => {{
                        if (response.ok) {{
                            alert('Customer added successfully!');
                            location.reload();
                        }} else {{
                            alert('Error adding customer');
                        }}
                    }})
                    .catch(error => {{
                        console.error('Error:', error);
                        alert('Error adding customer');
                    }});
                    
                    closeAddModal();
                }}
            </script>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        error_html = f"""
        <html><body style="font-family: Arial; padding: 50px; background: #1a1a1a; color: white;">
            <h1>Error Loading Customers</h1>
            <p>Error: {str(e)}</p>
        </body></html>
        """
        return error_html

@router.delete("/chat-logs/{session_id}")
async def delete_chat_session(session_id: str, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Delete a chat session and all its messages"""
    try:
        session_service = SessionService(db)
        
        # Get session first to verify it exists
        session = session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
        
        # Delete all messages in the session
        from database.models import ChatMessage
        db.query(ChatMessage).filter(ChatMessage.session_id == session.id).delete()
        
        # Delete the session
        from database.models import ChatSession
        db.query(ChatSession).filter(ChatSession.id == session.id).delete()
        
        db.commit()
        
        return {"success": True, "message": "Chat session deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting chat session: {str(e)}")

@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """Delete a customer and optionally their chat sessions"""
    try:
        customer_service = CustomerService(db)
        
        # Get customer first to verify it exists
        customer = customer_service.get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Delete all messages for customer's sessions
        from database.models import ChatMessage, ChatSession
        for session in customer.chat_sessions:
            db.query(ChatMessage).filter(ChatMessage.session_id == session.id).delete()
        
        # Delete all customer's chat sessions
        db.query(ChatSession).filter(ChatSession.customer_id == customer_id).delete()
        
        # Delete the customer
        from database.models import Customer
        db.query(Customer).filter(Customer.id == customer_id).delete()
        
        db.commit()
        
        return {"success": True, "message": "Customer and associated data deleted successfully"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting customer: {str(e)}")

@router.put("/customers/{customer_id}")
async def update_customer(
    customer_id: int, 
    customer_data: dict,
    db: Session = Depends(get_db), 
    user: dict = Depends(get_current_user)
):
    """Update customer information"""
    try:
        customer_service = CustomerService(db)
        
        # Get customer first to verify it exists
        customer = customer_service.get_customer(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Update customer fields
        for key, value in customer_data.items():
            if hasattr(customer, key) and value is not None:
                setattr(customer, key, value)
        
        db.commit()
        db.refresh(customer)
        
        return {"success": True, "message": "Customer updated successfully", "customer": {
            "id": customer.id,
            "name": customer.name,
            "email": customer.email,
            "company": customer.company,
            "phone": customer.phone,
            "address": customer.address,
            "notes": customer.notes
        }}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating customer: {str(e)}")

@router.get("/customers/{customer_id}", response_class=HTMLResponse)
async def view_customer_detail(customer_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
    """View detailed customer information"""
    try:
        customer_service = CustomerService(db)
        customer = customer_service.get_customer(customer_id)
        
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Build chat sessions HTML
        chats_html = ""
        if customer.chat_sessions:
            for session in customer.chat_sessions:
                message_count = len(session.messages) if session.messages else 0
                chats_html += f"""
                <tr style="background: rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <td style="padding: 12px;">
                        <a href="/admin/chat-logs/{session.session_id}" style="color: #00d4ff; text-decoration: none;">
                            {session.session_id[:20]}...
                        </a>
                    </td>
                    <td style="padding: 12px;">{message_count}</td>
                    <td style="padding: 12px;">
                        <span style="background: {'#00d4ff' if session.status == 'completed' else '#ffa500'}; 
                              color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8em;">
                            {session.status}
                        </span>
                    </td>
                    <td style="padding: 12px;">{session.created_at.strftime('%Y-%m-%d %H:%M') if session.created_at else 'N/A'}</td>
                    <td style="padding: 12px;">
                        <button onclick="deleteChat('{session.session_id}')" 
                                style="background: #ff6b6b; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                            Delete
                        </button>
                    </td>
                </tr>
                """
        else:
            chats_html = '<tr><td colspan="5" style="padding: 20px; text-align: center; color: #ccc;">No chat sessions found</td></tr>'
        
        # Parse additional websites
        additional_sites = ""
        if customer.additional_websites:
            import json
            try:
                sites = json.loads(customer.additional_websites)
                additional_sites = "<br>".join([f'<a href="{site}" target="_blank" style="color: #00d4ff;">{site}</a>' for site in sites])
            except:
                additional_sites = customer.additional_websites
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>StreamlineAI Admin - Customer Details</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%);
                    color: white;
                    min-height: 100vh;
                }}
                .header {{
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 20px 40px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }}
                .nav {{
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    margin: 30px 0;
                    padding: 20px;
                    background: rgba(0, 212, 255, 0.1);
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }}
                .nav a {{
                    color: #00d4ff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    font-weight: 600;
                }}
                .nav a:hover {{
                    background: rgba(0, 212, 255, 0.2);
                    border-color: #00d4ff;
                    transform: translateY(-2px);
                }}
                .nav a:hover {{
                    background: rgba(0, 212, 255, 0.2);
                    color: #00d4ff;
                }}
                .container {{
                    padding: 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                }}
                .info-grid {{
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }}
                .info-card {{
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 25px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }}
                .field {{
                    margin-bottom: 15px;
                }}
                .field-label {{
                    color: #00d4ff;
                    font-weight: 600;
                    margin-bottom: 5px;
                }}
                .field-value {{
                    background: rgba(0, 0, 0, 0.3);
                    padding: 10px;
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }}
                .table-container {{
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }}
                table {{
                    width: 100%;
                    border-collapse: collapse;
                }}
                th {{
                    background: rgba(0, 212, 255, 0.2);
                    color: #00d4ff;
                    padding: 15px 12px;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1 style="margin: 0; color: #00d4ff; font-size: 28px;">
                    ⚡ StreamlineAI Admin
                </h1>
                <div class="nav">
                    <a href="/admin/chat-logs">Chat Logs</a>
                    <strong style="color: white; padding: 10px 20px; background: rgba(0, 212, 255, 0.3); border-radius: 6px;">Customers</strong>
                    <a href="/admin/schedule">Schedule</a>
                    <a href="/admin/admins">Admin Users</a>
                    <a href="/auth/logout" style="margin-left: auto; color: #ff6b6b;">Logout</a>
                </div>
            </div>
            
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <a href="/admin/customers" style="color: #00d4ff; text-decoration: none; font-size: 18px;">← Back to Customers</a>
                        <h2 style="margin: 0; color: #00d4ff;">Customer Details: {customer.name or 'Unnamed Customer'}</h2>
                    </div>
                    <div>
                        <button onclick="editCustomer()" style="background: #00d4ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                            Edit Customer
                        </button>
                        <button onclick="deleteCustomerConfirm()" style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                            Delete Customer
                        </button>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-card">
                        <h3 style="margin: 0 0 20px 0; color: #00d4ff;">Contact Information</h3>
                        <div class="field">
                            <div class="field-label">Name</div>
                            <div class="field-value">{customer.name or 'Not provided'}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Email</div>
                            <div class="field-value">{customer.email}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Phone</div>
                            <div class="field-value">{customer.phone or 'Not provided'}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Address</div>
                            <div class="field-value">{customer.address or 'Not provided'}</div>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <h3 style="margin: 0 0 20px 0; color: #00d4ff;">Business Information</h3>
                        <div class="field">
                            <div class="field-label">Primary Website</div>
                            <div class="field-value">
                                {f'<a href="{customer.business_site}" target="_blank" style="color: #00d4ff;">{customer.business_site}</a>' if customer.business_site else 'Not provided'}
                            </div>
                        </div>
                        <div class="field">
                            <div class="field-label">Additional Websites</div>
                            <div class="field-value">{additional_sites or 'None'}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Business Type</div>
                            <div class="field-value">{customer.business_type or 'Not specified'}</div>
                        </div>
                        <div class="field">
                            <div class="field-label">Status</div>
                            <div class="field-value">
                                <span style="background: {'#00d4ff' if customer.status == 'customer' else '#ff6b6b' if customer.status == 'lead' else '#ffa500'}; 
                                      color: white; padding: 6px 12px; border-radius: 12px; font-size: 0.9em;">
                                    {customer.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="info-card" style="margin-bottom: 30px;">
                    <h3 style="margin: 0 0 15px 0; color: #00d4ff;">Notes</h3>
                    <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); min-height: 100px;">
                        {customer.notes or 'No notes available'}
                    </div>
                </div>
                
                <h3 style="color: #00d4ff; margin-bottom: 20px;">Chat Sessions ({len(customer.chat_sessions) if customer.chat_sessions else 0})</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Session ID</th>
                                <th>Messages</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chats_html}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <script>
                function editCustomer() {{
                    // Create modal HTML
                    const modalHtml = `
                        <div id="editModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;">
                            <div style="background: #2a2a2a; padding: 30px; border-radius: 12px; width: 500px; max-height: 80vh; overflow-y: auto;">
                                <h3 style="margin-top: 0; color: #00d4ff;">Edit Customer Information</h3>
                                <form id="editForm">
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Name</label>
                                        <input type="text" id="editName" value="{customer.name or ''}" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Email</label>
                                        <input type="email" id="editEmail" value="{customer.email}" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Phone</label>
                                        <input type="text" id="editPhone" value="{customer.phone or ''}" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Company</label>
                                        <input type="text" id="editCompany" value="{customer.company or ''}" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Address</label>
                                        <textarea id="editAddress" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white; height: 80px;">{customer.address or ''}</textarea>
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Business Website</label>
                                        <input type="url" id="editBusinessSite" value="{customer.business_site or ''}" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Business Type</label>
                                        <input type="text" id="editBusinessType" value="{customer.business_type or ''}" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white;">
                                    </div>
                                    <div style="margin-bottom: 20px;">
                                        <label style="display: block; margin-bottom: 8px; color: #ccc;">Notes</label>
                                        <textarea id="editNotes" style="width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; border-radius: 6px; color: white; height: 100px;">{customer.notes or ''}</textarea>
                                    </div>
                                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                                        <button type="button" onclick="closeEditModal()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancel</button>
                                        <button type="submit" style="background: #00d4ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Save Changes</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `;
                    
                    // Add modal to page
                    document.body.insertAdjacentHTML('beforeend', modalHtml);
                    
                    // Handle form submission
                    document.getElementById('editForm').onsubmit = function(e) {{
                        e.preventDefault();
                        saveCustomerChanges();
                    }};
                }}
                
                function closeEditModal() {{
                    const modal = document.getElementById('editModal');
                    if (modal) {{
                        modal.remove();
                    }}
                }}
                
                function saveCustomerChanges() {{
                    const formData = {{
                        name: document.getElementById('editName').value,
                        email: document.getElementById('editEmail').value,
                        phone: document.getElementById('editPhone').value,
                        company: document.getElementById('editCompany').value,
                        address: document.getElementById('editAddress').value,
                        business_site: document.getElementById('editBusinessSite').value,
                        business_type: document.getElementById('editBusinessType').value,
                        notes: document.getElementById('editNotes').value
                    }};
                    
                    fetch(`/admin/customers/{customer_id}`, {{
                        method: 'PUT',
                        headers: {{
                            'Content-Type': 'application/json'
                        }},
                        body: JSON.stringify(formData)
                    }})
                    .then(response => {{
                        if (response.ok) {{
                            alert('Customer updated successfully!');
                            location.reload(); // Refresh the page to show changes
                        }} else {{
                            alert('Error updating customer');
                        }}
                    }})
                    .catch(error => {{
                        console.error('Error:', error);
                        alert('Error updating customer');
                    }});
                    
                    closeEditModal();
                }}
                
                function deleteCustomerConfirm() {{
                    if (confirm('Are you sure you want to delete this customer and ALL their chat data? This action cannot be undone.')) {{
                        fetch(`/admin/customers/{customer_id}`, {{
                            method: 'DELETE',
                            headers: {{
                                'Content-Type': 'application/json'
                            }}
                        }})
                        .then(response => {{
                            if (response.ok) {{
                                window.location.href = '/admin/customers';
                            }} else {{
                                alert('Error deleting customer');
                            }}
                        }});
                    }}
                }}
                
                function deleteChat(sessionId) {{
                    if (confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {{
                        fetch(`/admin/chat-logs/${{sessionId}}`, {{
                            method: 'DELETE',
                            headers: {{
                                'Content-Type': 'application/json'
                            }}
                        }})
                        .then(response => {{
                            if (response.ok) {{
                                location.reload();
                            }} else {{
                                alert('Error deleting chat session');
                            }}
                        }});
                    }}
                }}
            </script>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        error_html = f"""
        <html><body style="font-family: Arial; padding: 50px; background: #1a1a1a; color: white;">
            <h1>Error Loading Customer Details</h1>
            <p>Error: {str(e)}</p>
        </body></html>
        """
        return error_html
