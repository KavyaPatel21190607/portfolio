import os
import resend
from datetime import datetime
import dotenv
# Load environment variables from .env file
dotenv.load_dotenv()

class EmailService:
    def __init__(self):
        self.api_key = os.environ.get('RESEND_API_KEY')
        if self.api_key:
            resend.api_key = self.api_key
    
    def send_contact_notification(self, contact_data):
        """Send formatted email notification for contact form submission"""
        if not self.api_key:
            return {"success": False, "error": "Email service not configured"}
        
        try:
            # Format the submission time
            submission_time = datetime.now().strftime("%B %d, %Y at %I:%M %p")
            
            # Create formatted HTML email content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
                    .header h1 {{ margin: 0; font-size: 24px; }}
                    .content {{ padding: 30px; }}
                    .field {{ margin-bottom: 20px; }}
                    .field-label {{ font-weight: bold; color: #333; margin-bottom: 5px; }}
                    .field-value {{ background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; }}
                    .message-field {{ background: #f8f9fa; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; line-height: 1.6; }}
                    .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }}
                    .timestamp {{ color: #888; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌟 New Contact Form Submission</h1>
                        <p>Someone reached out through your portfolio website!</p>
                    </div>
                    
                    <div class="content">
                        <div class="field">
                            <div class="field-label">👤 Name:</div>
                            <div class="field-value">{contact_data.get('name', 'Not provided')}</div>
                        </div>
                        
                        <div class="field">
                            <div class="field-label">📧 Email:</div>
                            <div class="field-value">{contact_data.get('email', 'Not provided')}</div>
                        </div>
                        
                        <div class="field">
                            <div class="field-label">📝 Subject:</div>
                            <div class="field-value">{contact_data.get('subject', 'No subject')}</div>
                        </div>
                        
                        <div class="field">
                            <div class="field-label">💬 Message:</div>
                            <div class="message-field">{contact_data.get('message', 'No message provided')}</div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p class="timestamp">Received on {submission_time}</p>
                        <p>This email was sent from your portfolio contact form at kavyapatel.dev</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
New Contact Form Submission - Kavya Patel Portfolio

Name: {contact_data.get('name', 'Not provided')}
Email: {contact_data.get('email', 'Not provided')}
Subject: {contact_data.get('subject', 'No subject')}

Message:
{contact_data.get('message', 'No message provided')}

Received on: {submission_time}
Sent from: Portfolio Contact Form
            """
            
            # Send email using Resend to your verified email
            email_response = resend.Emails.send({
                "from": "Portfolio Contact <onboarding@resend.dev>",
                "to": ["kavyapatel1952007@gmail.com"],  # Your verified email address
                "subject": f"📧 New Contact: {contact_data.get('subject', 'Message from Portfolio')}",
                "html": html_content,
                "text": text_content,
                "reply_to": contact_data.get('email', 'noreply@resend.dev')
            })
            
            return {
                "success": True, 
                "message": "Thank you! Your message has been sent successfully.",
                "email_id": email_response.get('id')
            }
            
        except Exception as e:
            print(f"Email sending error: {str(e)}")
            return {
                "success": False, 
                "error": f"Failed to send email: {str(e)}"
            }
    
    def send_auto_reply(self, contact_data):
        """Send automatic reply to the person who submitted the form"""
        if not self.api_key or not contact_data.get('email'):
            return {"success": False, "error": "Cannot send auto-reply"}
        
        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
                    .content {{ padding: 30px; line-height: 1.6; }}
                    .footer {{ background: #f8f9fa; padding: 20px; text-align: center; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✨ Thank You for Reaching Out!</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hi {contact_data.get('name', 'there')},</p>
                        
                        <p>Thank you for contacting me through my portfolio website! I've received your message and really appreciate you taking the time to reach out.</p>
                        
                        <p><strong>Your message details:</strong></p>
                        <p><em>Subject: {contact_data.get('subject', 'No subject')}</em></p>
                        
                        <p>I'll review your message and get back to you as soon as possible, typically within 24-48 hours.</p>
                        
                        <p>In the meantime, feel free to:</p>
                        <ul>
                            <li>Check out my latest projects on the portfolio</li>
                            <li>Connect with me on social media</li>
                            <li>Explore my skills and experience</li>
                        </ul>
                        
                        <p>Best regards,<br><strong>Kavya Patel</strong></p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated response from kavyapatel.dev</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
Hi {contact_data.get('name', 'there')},

Thank you for contacting me through my portfolio website! I've received your message about "{contact_data.get('subject', 'No subject')}" and really appreciate you taking the time to reach out.

I'll review your message and get back to you as soon as possible, typically within 24-48 hours.

Best regards,
Kavya Patel

---
This is an automated response from kavyapatel.dev
            """
            
            resend.Emails.send({
                "from": "Kavya Patel <onboarding@resend.dev>",
                "to": [contact_data.get('email')],
                "subject": "✨ Thank you for your message - Kavya Patel",
                "html": html_content,
                "text": text_content
            })
            return {"success": True}
            
        except Exception as e:
            print(f"Auto-reply error: {str(e)}")
            return {"success": False, "error": str(e)}