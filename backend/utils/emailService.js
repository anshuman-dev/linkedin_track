import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendMagicLink(email, token) {
    const magicLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'LinkedIn Tracker - Magic Link Login',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">LinkedIn Tracker Login</h2>
          <p>Click the button below to securely log in to your LinkedIn Tracker dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              🔐 Log In
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 15 minutes for security purposes.
            <br>
            If you didn't request this login, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            LinkedIn Tracker System - Automated compliance tracking
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default EmailService;