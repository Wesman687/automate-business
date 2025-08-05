from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from database import get_db
from services.session_service import SessionService
from services.customer_service import CustomerService
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/chat-logs/{session_id}", response_class=HTMLResponse)
async def view_chat_log(session_id: str, db: Session = Depends(get_db)):
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
            </style>
        </head>
        <body>
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
async def list_chat_logs(db: Session = Depends(get_db)):
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
            </style>
        </head>
        <body>
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
        error_html = f"""
        <html><body style="font-family: Arial; padding: 50px; background: #1a1a1a; color: white;">
            <h1>Error Loading Chat Logs</h1>
            <p>Error: {str(e)}</p>
        </body></html>
        """
        return error_html
