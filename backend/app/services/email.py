import html
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional
from backend.app.config import settings

logger = logging.getLogger("society_maintenance.email")
logging.basicConfig(level=logging.INFO)


def send_email_sync(
    recipient_emails: List[str],
    subject: str,
    text_content: str,
    html_content: Optional[str] = None
) -> bool:
    if not recipient_emails:
        return False

    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.info("=" * 60)
        logger.info(f"📧 [MOCK EMAIL DISPATCH]")
        logger.info(f"To: {', '.join(recipient_emails)}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body Preview:\n{text_content}")
        logger.info("=" * 60)
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = ", ".join(recipient_emails)

        msg.attach(MIMEText(text_content, "plain"))
        if html_content:
            msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            if settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, recipient_emails, msg.as_string())

        logger.info(f"✅ Email successfully sent to {recipient_emails}: {subject}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to send email to {recipient_emails}: {e}")
        return False


def send_status_update_notification(
    resident_email: str,
    resident_name: str,
    complaint_title: str,
    complaint_id: int,
    old_status: Optional[str],
    new_status: str,
    actor_name: str,
    note: Optional[str] = None
):
    subject = f"[Society Maintenance] Complaint #{complaint_id} Status Updated: {new_status}"
    
    text_content = f"""Hello {resident_name},

Your maintenance complaint #{complaint_id} ("{complaint_title}") has been updated.

Status Change: {old_status or 'Created'} ➔ {new_status}
Updated by: {actor_name}
{f'Admin Note: {note}' if note else ''}

You can track your complaint progress in the Society Maintenance Tracker portal.

Regards,
Society Management Team
"""

    safe_name = html.escape(resident_name)
    safe_title = html.escape(complaint_title)
    safe_status = html.escape(new_status)
    safe_actor = html.escape(actor_name)
    safe_note = html.escape(note) if note else ""

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Maintenance Status Update</h2>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
            <p>Hello <strong>{safe_name}</strong>,</p>
            <p>Your maintenance complaint <strong>#{complaint_id} &mdash; "{safe_title}"</strong> has a status update.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <p style="margin: 0 0 8px 0;"><strong>Status:</strong> <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; background: #e0e7ff; color: #3730a3; font-weight: bold;">{safe_status}</span></p>
                <p style="margin: 0 0 8px 0;"><strong>Updated by:</strong> {safe_actor}</p>
                {f'<p style="margin: 0;"><strong>Note:</strong> {safe_note}</p>' if safe_note else ''}
            </div>
            
            <p>Log in to your resident portal to view full complaint history and details.</p>
            <p style="margin-top: 24px; font-size: 0.9em; color: #64748b;">Society Maintenance Management Team</p>
        </div>
    </div>
    """

    send_email_sync([resident_email], subject, text_content, html_content)


def send_important_notice_notification(
    recipient_emails: List[str],
    notice_title: str,
    notice_body: str,
    admin_name: str
):
    if not recipient_emails:
        return

    subject = f"🚨 [Important Notice] {notice_title}"

    text_content = f"""Important Society Notice

Title: {notice_title}
Posted by: {admin_name}

{notice_body}

Please visit the Society Notice Board for details.

Regards,
Society Management Team
"""

    safe_title = html.escape(notice_title)
    safe_body = html.escape(notice_body)
    safe_admin = html.escape(admin_name)

    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fecaca; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #dc2626; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">🚨 Important Notice</h2>
        </div>
        <div style="padding: 24px; color: #1e293b; line-height: 1.6;">
            <h3 style="color: #991b1b; margin-top: 0;">{safe_title}</h3>
            <p style="white-space: pre-line; background-color: #fef2f2; padding: 16px; border-radius: 6px; border: 1px solid #fee2e2;">
                {safe_body}
            </p>
            <p style="font-size: 0.9em; color: #64748b;">Posted by {safe_admin} &bull; Society Management</p>
        </div>
    </div>
    """

    send_email_sync(recipient_emails, subject, text_content, html_content)
