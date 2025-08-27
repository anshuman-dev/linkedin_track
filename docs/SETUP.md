# LinkedIn Tracker - Setup Guide

## 📋 Overview

This guide will help you set up the LinkedIn Tracker application locally and deploy it to Netlify.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd linkedin-tracker

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Return to root
cd ..
```

### 2. Environment Setup

Create environment variables for local development:

**Frontend (.env in frontend/):**
```bash
# Optional - defaults to development API
VITE_API_URL=http://localhost:8888/.netlify/functions
```

**Backend (.env in backend/):**
```bash
# Database
DATABASE_PATH=../database/linkedin_tracker.db

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secure-jwt-secret-here

# Email Configuration (for magic links)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Frontend URL (for magic link redirects)
FRONTEND_URL=http://localhost:5173

# Admin emails (comma-separated)
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### 3. Database Setup

```bash
# Create database directory
mkdir -p database

# Initialize SQLite database
cd database
sqlite3 linkedin_tracker.db < schema.sql

# Add initial admin user and sample data (optional)
sqlite3 linkedin_tracker.db < seed.sql
```

### 4. Local Development

```bash
# Terminal 1 - Start Netlify Functions (backend)
cd backend
npm run dev

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8888/.netlify/functions

## 🌐 Netlify Deployment

### 1. Prepare for Deployment

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Configure build settings in Netlify

### 2. Netlify Configuration

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `frontend/dist`
- Functions directory: `backend/functions`

### 3. Environment Variables

Add these environment variables in Netlify dashboard:

```bash
# Database (Netlify will use /tmp for serverless functions)
DATABASE_PATH=/tmp/linkedin_tracker.db

# JWT Secret (generate a secure random string)
JWT_SECRET=your-production-jwt-secret

# Email Configuration
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password

# Frontend URL (your Netlify domain)
FRONTEND_URL=https://your-app.netlify.app

# Admin emails
ADMIN_EMAILS=admin1@yourdomain.com,admin2@yourdomain.com
```

### 4. Database Initialization

Since Netlify functions are stateless, the database will be recreated on each function cold start. The database setup is handled automatically in the `Database` class initialization.

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App-specific password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "LinkedIn Tracker"
3. Use this app password in `EMAIL_PASS` environment variable

### Alternative Email Providers

You can modify `backend/utils/emailService.js` to use other providers:
- SendGrid
- Mailgun
- AWS SES
- Any SMTP provider

## 👥 Admin Management

### Adding Admins

Admins are managed in the database `admins` table. To add a new admin:

```sql
INSERT INTO admins (email, name) VALUES ('new-admin@example.com', 'Admin Name');
```

Or modify `database/seed.sql` and reinitialize the database.

### Admin Authentication

- Admins login using magic links sent to their email
- Only emails in the `admins` table with `is_active = 1` can access the system
- JWT tokens expire after 24 hours

## 🛠️ Customization

### Adding New Member Fields

1. Update database schema in `database/schema.sql`
2. Modify member forms in `frontend/src/pages/Members.jsx`
3. Update API in `backend/functions/members.js`

### Modifying Chat Parser

The WhatsApp chat parser can be customized in `backend/utils/chatParser.js`:
- Add new LinkedIn URL patterns
- Modify support reaction detection
- Adjust member name matching logic

### Styling Changes

- Tailwind CSS configuration: `frontend/tailwind.config.js`
- Global styles: `frontend/src/index.css`
- Component styles: Individual component files

## 🐛 Troubleshooting

### Common Issues

**1. Database not found:**
- Ensure `DATABASE_PATH` environment variable is set correctly
- Check that SQLite database file exists and has correct permissions

**2. Magic link emails not sending:**
- Verify email credentials in environment variables
- Check Gmail app password is correct
- Ensure 2-factor authentication is enabled

**3. CORS errors:**
- Verify API endpoints are properly configured in `netlify.toml`
- Check that frontend API calls match backend function names

**4. File upload failures:**
- Ensure file size is under 10MB
- Check that uploaded files are .txt format
- Verify multipart form data parsing in backend

### Local Development Issues

**Functions not starting:**
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Ensure you're in the root directory when running netlify dev
cd /path/to/linkedin-tracker
netlify dev
```

**Database permission issues:**
```bash
# Ensure database directory has write permissions
chmod 755 database/
chmod 664 database/linkedin_tracker.db
```

## 📊 Usage Guide

### Weekly Workflow

1. **Export WhatsApp Chat:**
   - Open WhatsApp group
   - Tap group name → Export chat → Without Media
   - Save .txt file

2. **Upload to System:**
   - Login to LinkedIn Tracker
   - Navigate to Upload page
   - Drag & drop chat file
   - Select week date range
   - Click "Process Chat Export"

3. **Review Results:**
   - View compliance dashboard
   - Check member statistics
   - Export CSV if needed

### Member Management

1. **Add Members:**
   - Go to Members page
   - Click "Add Member"
   - Enter name, WhatsApp last 5 digits, LinkedIn URL
   - Save member

2. **Bulk Import:** 
   - Modify `database/seed.sql` with member data
   - Re-run database initialization

## 🔒 Security Considerations

- JWT tokens expire after 24 hours
- Magic link tokens expire after 15 minutes
- Only whitelisted admin emails can access the system
- Database is SQLite with no external access required
- All API endpoints require authentication except login/verify

## 📈 Performance Tips

- Keep WhatsApp exports under 10MB for faster processing
- Regularly clean up old reports to maintain database performance
- Consider implementing pagination for large member lists

## 🆘 Support

For issues and questions:
1. Check this documentation first
2. Review console errors in browser/server logs
3. Verify environment variables are set correctly
4. Test with sample data to isolate issues

---

**Next Steps:** Once setup is complete, refer to the architecture documentation for understanding the system design and extending functionality.