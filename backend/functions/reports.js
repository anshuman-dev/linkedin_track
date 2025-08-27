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
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const db = new Database();

  try {
    await db.init();
    verifyAuth(event);

    const { path } = event;
    const pathSegments = path.split('/').filter(Boolean);
    const reportId = pathSegments[pathSegments.length - 1];

    if (reportId && reportId !== 'reports') {
      // Get specific report
      const report = await db.query(`
        SELECT * FROM weekly_reports WHERE id = ?
      `, [reportId]);

      if (report.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Report not found' })
        };
      }

      // Get member statistics for this report
      const memberStats = await db.query(`
        SELECT 
          m.id,
          m.name,
          m.linkedin_url,
          COUNT(DISTINCT lp.id) as posts_count,
          COUNT(DISTINCT ms_given.id) as support_given,
          COUNT(DISTINCT ms_received.id) as support_received,
          CASE 
            WHEN COUNT(DISTINCT lp.id) > 0 THEN 'compliant'
            WHEN COUNT(DISTINCT ms_given.id) > 0 THEN 'partial'
            ELSE 'non-compliant'
          END as status
        FROM members m
        LEFT JOIN linkedin_posts lp ON m.id = lp.member_id AND lp.report_id = ?
        LEFT JOIN member_support ms_given ON m.id = ms_given.supporter_member_id AND ms_given.report_id = ?
        LEFT JOIN linkedin_posts lp_for_support ON lp_for_support.member_id = m.id AND lp_for_support.report_id = ?
        LEFT JOIN member_support ms_received ON lp_for_support.id = ms_received.post_id
        WHERE m.status = 'active'
        GROUP BY m.id, m.name, m.linkedin_url
        ORDER BY posts_count DESC, support_given DESC
      `, [reportId, reportId, reportId]);

      // Get posts for this report
      const posts = await db.query(`
        SELECT 
          lp.*,
          m.name as author_name,
          COUNT(ms.id) as reaction_count
        FROM linkedin_posts lp
        JOIN members m ON lp.member_id = m.id
        LEFT JOIN member_support ms ON lp.id = ms.post_id
        WHERE lp.report_id = ?
        GROUP BY lp.id
        ORDER BY lp.shared_at DESC
      `, [reportId]);

      // Get reactions for each post
      for (const post of posts) {
        const reactions = await db.query(`
          SELECT 
            ms.*,
            m.name as supporter_name
          FROM member_support ms
          JOIN members m ON ms.supporter_member_id = m.id
          WHERE ms.post_id = ?
          ORDER BY ms.reacted_at ASC
        `, [post.id]);
        post.reactions = reactions;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          report: report[0],
          memberStats,
          posts,
          summary: {
            totalMembers: memberStats.length,
            membersPosted: memberStats.filter(m => m.posts_count > 0).length,
            compliantMembers: memberStats.filter(m => m.status === 'compliant').length,
            totalPosts: posts.length,
            totalReactions: posts.reduce((sum, p) => sum + p.reaction_count, 0)
          }
        })
      };
    } else {
      // Get all reports
      const reports = await db.query(`
        SELECT 
          wr.*,
          a.name as uploaded_by_name,
          COUNT(DISTINCT lp.id) as posts_count,
          COUNT(DISTINCT lp.member_id) as members_posted
        FROM weekly_reports wr
        JOIN admins a ON wr.uploaded_by = a.id
        LEFT JOIN linkedin_posts lp ON wr.id = lp.report_id
        GROUP BY wr.id
        ORDER BY wr.processed_at DESC
      `);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ reports })
      };
    }

  } catch (error) {
    console.error('Reports API error:', error);
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