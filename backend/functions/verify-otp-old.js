import jwt from 'jsonwebtoken';

// Simple in-memory storage for OTP (shared with send-otp)
const otpStore = new Map();

export const handler = async (event, context) => {
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
    const { email, otp } = JSON.parse(event.body);

    if (!email || !otp) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email and OTP are required' })
      };
    }

    // Check OTP
    const storedOTP = otpStore.get(email);
    if (!storedOTP) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid or expired OTP' })
      };
    }

    // Check expiration
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(email);
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'OTP expired' })
      };
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid OTP' })
      };
    }

    // Clean up used OTP
    otpStore.delete(email);

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || 'development-secret';
    const token = jwt.sign(
      { 
        email, 
        name: 'Admin User',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      }, 
      jwtSecret
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        jwt: token,
        admin: {
          email,
          name: 'Admin User'
        }
      })
    };

  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};