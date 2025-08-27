-- Admins table
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);

-- Members table  
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  whatsapp_phone TEXT NOT NULL, -- last 5 digits for matching
  full_phone TEXT, -- optional full number
  linkedin_url TEXT,
  join_date DATE,
  status TEXT DEFAULT 'active', -- active/inactive
  custom_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Weekly reports (chat uploads)
CREATE TABLE weekly_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  uploaded_by INTEGER REFERENCES admins(id),
  chat_filename TEXT,
  total_messages INTEGER,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- LinkedIn posts found in chats
CREATE TABLE linkedin_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER REFERENCES weekly_reports(id),
  member_id INTEGER REFERENCES members(id),
  post_url TEXT NOT NULL,
  shared_at DATETIME,
  reaction_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support tracking (reactions)
CREATE TABLE member_support (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id INTEGER REFERENCES weekly_reports(id),
  post_id INTEGER REFERENCES linkedin_posts(id),
  supporter_member_id INTEGER REFERENCES members(id),
  reaction_type TEXT, -- emoji or text
  reacted_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Auth tokens for magic links
CREATE TABLE auth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);