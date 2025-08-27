# LinkedIn Tracker 📊

> Automate LinkedIn posting compliance tracking for WhatsApp groups

A web application that analyzes WhatsApp group chat exports to track LinkedIn posting compliance and member engagement. Perfect for professional networking groups that require weekly LinkedIn activity.

## ✨ Features

- **🔐 Magic Link Authentication** - Secure email-based admin login
- **👥 Member Management** - Track group members with WhatsApp and LinkedIn profiles
- **📤 Chat Upload & Processing** - Parse WhatsApp exports to find LinkedIn posts
- **📊 Compliance Dashboard** - Visual overview of posting activity and support
- **🎯 Support Tracking** - Automatically detect reactions and engagement
- **📈 Weekly Reports** - Generate compliance reports with member statistics
- **🎨 Clean UI** - Minimal, responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone & Install**
```bash
git clone <repo-url>
cd linkedin-tracker

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
```

2. **Configure Environment**
```bash
# Backend environment (.env in backend/)
DATABASE_PATH=../database/linkedin_tracker.db
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAILS=admin@example.com
```

3. **Initialize Database**
```bash
mkdir database
cd database
sqlite3 linkedin_tracker.db < schema.sql
sqlite3 linkedin_tracker.db < seed.sql
```

4. **Start Development**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Visit `http://localhost:5173` to access the application.

## 📖 How It Works

1. **Admin Setup** - Add admin emails to database for magic link access
2. **Member Management** - Add group members with WhatsApp phone (last 5 digits) and LinkedIn profiles
3. **Weekly Workflow**:
   - Export WhatsApp group chat (without media)
   - Upload .txt file to the system
   - System parses messages to find LinkedIn URLs and reactions
   - Generate compliance report showing who posted and who supported

## 🏗️ Architecture

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Netlify Functions + Express-style routing
- **Database**: SQLite3 with automatic schema management
- **Authentication**: JWT tokens with magic link email verification
- **Deployment**: Netlify with auto-deploy from Git

## 📊 Key Metrics Tracked

- LinkedIn posts shared per member
- Support reactions given/received
- Compliance percentage (posted vs. just supported)
- Weekly engagement trends
- Member activity status

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React, Tailwind CSS, Vite |
| Backend | Node.js, Netlify Functions |
| Database | SQLite3 |
| Authentication | JWT + Magic Links |
| Email | Nodemailer (Gmail) |
| Deployment | Netlify |
| File Processing | Custom WhatsApp parser |

## 📱 Usage Example

**WhatsApp Chat:**
```
8/23/25, 6:20 PM - Neel: https://linkedin.com/posts/neelpanji_startup-growth
8/23/25, 6:21 PM - Abhishek: 👍
8/23/25, 6:22 PM - Aakanksha: Great insights!
```

**System Output:**
- ✅ Neel Panji: 1 post, 2 reactions received
- 🤝 Abhishek: 0 posts, 1 reaction given  
- 🤝 Aakanksha: 0 posts, 1 reaction given

## 🚢 Deployment

### Netlify Deploy

1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy automatically on git push

See `docs/SETUP.md` for detailed deployment instructions.

## 📋 Requirements

- Admin email whitelist for access control
- WhatsApp group chat exports (.txt format)
- Gmail account for magic link emails (or configure alternative SMTP)
- Group members must be pre-registered with phone number matching

## 🔮 Future Enhancements

- [ ] Multi-group support
- [ ] Historical trend analytics  
- [ ] Automated email reminders
- [ ] Bulk member import
- [ ] Mobile app version
- [ ] Advanced filtering & search

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 💡 Use Cases

- Professional networking WhatsApp groups
- LinkedIn engagement accountability
- Team social media compliance tracking
- Mastermind group activity monitoring
- Business development team metrics

---

**Built with ❤️ for professional networking communities**

For detailed setup instructions, see [`docs/SETUP.md`](docs/SETUP.md)