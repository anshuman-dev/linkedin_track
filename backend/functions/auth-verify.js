import Database from '../utils/database.js';
import jwt from 'jsonwebtoken';

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

  const db = new Database();

  try {
    await db.init();
    const { token } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Token is required' })
      };
    }

    // Find and validate token
    const authToken = await db.query(
      'SELECT * FROM auth_tokens WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
      [token]
    );

    if (authToken.length === 0) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    const { email } = authToken[0];

    // Get admin details
    const admin = await db.query('SELECT * FROM admins WHERE email = ? AND is_active = 1', [email]);
    
    if (admin.length === 0) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Admin not found' })
      };
    }

    // Mark token as used
    await db.run('UPDATE auth_tokens SET used = 1 WHERE token = ?', [token]);

    // Update last login
    await db.run('UPDATE admins SET last_login = datetime("now") WHERE email = ?', [email]);

    // Generate JWT
    const jwtToken = jwt.sign(
      { 
        id: admin[0].id, 
        email: admin[0].email, 
        name: admin[0].name 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        jwt: jwtToken,
        admin: {
          id: admin[0].id,
          name: admin[0].name,
          email: admin[0].email
        }
      })
    };

  } catch (error) {
    console.error('Verify error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    await db.close();
  }
};