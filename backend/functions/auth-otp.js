const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Global in-memory storage (works within single function)
let otpStore = new Map();

// Admin emails
const ADMIN_EMAILS = ['mailsinghanshuman@gmail.com'];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, email, otp } = JSON.parse(event.body);

    // SEND OTP
    if (action === 'send') {
      if (!email) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Email is required' })
        };
      }

      if (!ADMIN_EMAILS.includes(email)) {
        return {
          statusCode: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Unauthorized email' })
        };
      }

      const newOtp = generateOTP();
      const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
      
      // Store OTP with timestamp
      otpStore.set(email, { otp: newOtp, expiresAt, timestamp: Date.now() });

      // Send email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'LinkedIn Tracker - Login OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">LinkedIn Tracker Login</h2>
            <p>Hello! Here is your login verification code:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="font-size: 48px; margin: 0; color: #0066cc; letter-spacing: 8px;">${newOtp}</h1>
              <p style="margin: 10px 0 0 0; color: #666;">Your 6-digit verification code</p>
            </div>
            <p><strong>This code expires in 10 minutes.</strong></p>
            <p>Generated at: ${new Date().toLocaleString()}</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: true, 
          message: `OTP sent to ${email}`,
          debug: `Generated: ${newOtp}, Expires: ${new Date(expiresAt).toLocaleString()}`
        })
      };
    }

    // VERIFY OTP
    if (action === 'verify') {
      if (!email || !otp) {
        return {
          statusCode: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ error: 'Email and OTP are required' })
        };
      }

      const storedData = otpStore.get(email);
      if (!storedData) {
        return {
          statusCode: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            error: 'No OTP found for this email',
            debug: `Available keys: ${Array.from(otpStore.keys())}`
          })
        };
      }

      // Check expiration
      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return {
          statusCode: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            error: 'OTP expired',
            debug: `Expired at: ${new Date(storedData.expiresAt).toLocaleString()}, Now: ${new Date().toLocaleString()}`
          })
        };
      }

      // Verify OTP
      if (storedData.otp !== otp) {
        return {
          statusCode: 401,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            error: 'Invalid OTP',
            debug: `Expected: ${storedData.otp}, Got: ${otp}`
          })
        };
      }

      // Clean up
      otpStore.delete(email);

      // Create JWT
      const jwtSecret = process.env.JWT_SECRET || 'development-secret';
      const token = jwt.sign(
        { 
          email, 
          name: 'Admin User',
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        }, 
        jwtSecret
      );

      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          success: true,
          jwt: token,
          admin: { email, name: 'Admin User' }
        })
      };
    }

    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Invalid action. Use "send" or "verify"' })
    };

  } catch (error) {
    console.error('Auth OTP error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        error: `Server error: ${error.message}`,
        stack: error.stack
      })
    };
  }
};