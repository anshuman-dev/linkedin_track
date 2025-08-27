import Database from '../utils/database.js';
import { WhatsAppChatParser } from '../utils/chatParser.js';
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const db = new Database();

  try {
    await db.init();
    const admin = verifyAuth(event);

    // Parse multipart form data (simplified for demo)
    const boundary = event.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid content type' })
      };
    }

    const body = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const parts = body.toString().split(`--${boundary}`);
    
    let chatContent = '';
    let weekStart = '';
    let weekEnd = '';
    let filename = '';

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data; name="chatFile"')) {
        const contentStart = part.indexOf('\r\n\r\n');
        if (contentStart !== -1) {
          chatContent = part.substring(contentStart + 4).trim();
          const filenameMatch = part.match(/filename="([^"]+)"/);
          if (filenameMatch) filename = filenameMatch[1];
        }
      } else if (part.includes('name="weekStart"')) {
        const contentStart = part.indexOf('\r\n\r\n');
        if (contentStart !== -1) {
          weekStart = part.substring(contentStart + 4).trim();
        }
      } else if (part.includes('name="weekEnd"')) {
        const contentStart = part.indexOf('\r\n\r\n');
        if (contentStart !== -1) {
          weekEnd = part.substring(contentStart + 4).trim();
        }
      }
    }

    if (!chatContent) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No chat file content found' })
      };
    }

    // Get all members for name matching
    const members = await db.query('SELECT * FROM members WHERE status = "active"');
    
    // Parse the chat
    const parser = new WhatsAppChatParser();
    const parseResult = await parser.parseChat(chatContent, members);

    // Auto-detect date range if not provided
    if (!weekStart || !weekEnd) {
      if (parseResult.messages.length > 0) {
        const dates = parseResult.messages.map(m => m.timestamp).sort();
        weekStart = dates[0].toISOString().split('T')[0];
        weekEnd = dates[dates.length - 1].toISOString().split('T')[0];
      }
    }

    // Create weekly report
    const reportResult = await db.run(`
      INSERT INTO weekly_reports (week_start, week_end, uploaded_by, chat_filename, total_messages)
      VALUES (?, ?, ?, ?, ?)
    `, [weekStart, weekEnd, admin.id, filename, parseResult.totalMessages]);

    const reportId = reportResult.lastID;

    // Insert LinkedIn posts
    for (const post of parseResult.linkedinPosts) {
      const postResult = await db.run(`
        INSERT INTO linkedin_posts (report_id, member_id, post_url, shared_at, reaction_count)
        VALUES (?, ?, ?, ?, ?)
      `, [reportId, post.memberId, post.url, post.sharedAt.toISOString(), post.reactions.length]);

      const postId = postResult.lastID;

      // Insert support actions for this post
      for (const reaction of post.reactions) {
        await db.run(`
          INSERT INTO member_support (report_id, post_id, supporter_member_id, reaction_type, reacted_at)
          VALUES (?, ?, ?, ?, ?)
        `, [reportId, postId, reaction.memberId, reaction.reaction, reaction.timestamp.toISOString()]);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        reportId,
        summary: {
          totalMessages: parseResult.totalMessages,
          linkedinPosts: parseResult.linkedinPosts.length,
          membersPosted: parseResult.summary.membersPosted,
          totalReactions: parseResult.supportActions.length,
          weekStart,
          weekEnd
        }
      })
    };

  } catch (error) {
    console.error('Upload chat error:', error);
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