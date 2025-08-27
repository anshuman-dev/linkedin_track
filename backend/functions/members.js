import Database from '../utils/database.js';
import jwt from 'jsonwebtoken';

const verifyAuth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }
  
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const db = new Database();

  try {
    await db.init();
    verifyAuth(event);

    const { httpMethod, path } = event;
    const pathSegments = path.split('/').filter(Boolean);
    const memberId = pathSegments[pathSegments.length - 1];

    switch (httpMethod) {
      case 'GET':
        const members = await db.query(`
          SELECT id, name, whatsapp_phone, linkedin_url, join_date, status, custom_notes, 
                 created_at, updated_at 
          FROM members 
          ORDER BY name ASC
        `);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ members })
        };

      case 'POST':
        const newMember = JSON.parse(event.body);
        const { name, whatsapp_phone, linkedin_url, join_date, status = 'active', custom_notes } = newMember;

        if (!name || !whatsapp_phone) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Name and WhatsApp phone are required' })
          };
        }

        const result = await db.run(`
          INSERT INTO members (name, whatsapp_phone, linkedin_url, join_date, status, custom_notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [name, whatsapp_phone, linkedin_url, join_date, status, custom_notes]);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ 
            success: true, 
            id: result.lastID,
            message: 'Member created successfully' 
          })
        };

      case 'PUT':
        const updatedMember = JSON.parse(event.body);
        const { name: updatedName, whatsapp_phone: updatedPhone, linkedin_url: updatedLinkedIn, 
                join_date: updatedJoinDate, status: updatedStatus, custom_notes: updatedNotes } = updatedMember;

        await db.run(`
          UPDATE members 
          SET name = ?, whatsapp_phone = ?, linkedin_url = ?, join_date = ?, status = ?, 
              custom_notes = ?, updated_at = datetime('now')
          WHERE id = ?
        `, [updatedName, updatedPhone, updatedLinkedIn, updatedJoinDate, updatedStatus, updatedNotes, memberId]);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Member updated successfully' 
          })
        };

      case 'DELETE':
        await db.run('DELETE FROM members WHERE id = ?', [memberId]);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: 'Member deleted successfully' 
          })
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

  } catch (error) {
    console.error('Members API error:', error);
    const status = error.message === 'No valid authorization header' ? 401 : 500;
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  } finally {
    await db.close();
  }
};