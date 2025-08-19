# services/portal_invite_service.py
from sqlalchemy.orm import Session
from api.email import send_notification
from database.models import PortalInvite, User as CustomerModel
from datetime import datetime, timedelta
import secrets, os

PORTAL_BASE_URL = "https://stream-lineai.com/portal"

class PortalInviteService:
    def __init__(self, db: Session):
        self.db = db

    def create_invite(self, customer: CustomerModel) -> PortalInvite:
        token = secrets.token_urlsafe(32)
        invite = PortalInvite(
            customer_id=customer.id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(days=3),
        )
        self.db.add(invite)
        self.db.commit()
        self.db.refresh(invite)
        return invite

    def invite_link(self, token: str) -> str:
        # Your portal page that handles token (set password / claim account)
        return f"{PORTAL_BASE_URL}/onboarding?token={token}"

    def send_invite_email(self, customer: CustomerModel, link: str):
        # Replace with your mailer
        subject = "Set up your Stream-Line AI portal access"
        html = f"""
        <p>Hi {customer.name or ''},</p>
        <p>Welcome to Stream-Line AI! Use the link below to create your password and access the customer portal:</p>
        <p><a href="{link}">{link}</a></p>
        <p>This link expires in 3 days. If you didn’t request this, ignore this email.</p>
        """
        # utils.mailer.send_email(to=customer.email, subject=subject, html=html)
        send_notification(to=customer.email, subject=subject, html_body=html)

    def create_and_send(self, customer: CustomerModel) -> str:
        invite = self.create_invite(customer)
        link = self.invite_link(invite.token)
        if customer.email:
            self.send_invite_email(customer, link)
        return link
