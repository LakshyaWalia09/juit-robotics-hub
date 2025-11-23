# Quick Start Guide - Backend Setup

## 🚀 5-Minute Setup

### 1. Create Supabase Project (2 min)
```bash
1. Go to https://supabase.com
2. Create new project
3. Copy Project URL and anon key
```

### 2. Configure Environment (30 sec)
```bash
# Update .env file
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migration (1 min)
```bash
1. Open Supabase SQL Editor
2. Copy content from: supabase/migrations/20241123_initial_schema.sql
3. Paste and run
```

### 4. Create Admin User (1 min)
```bash
1. Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Email: admin@juit.ac.in
4. Password: your-secure-password
5. Check "Auto Confirm User"
6. Create
```

### 5. Start Development (30 sec)
```bash
npm install
npm run dev
```

## ✅ Test It Works

1. **Test Project Submission**
   - Go to http://localhost:5173
   - Submit a test project
   - Should see success message

2. **Test Admin Login**
   - Go to http://localhost:5173/admin
   - Login with admin credentials
   - Should redirect to dashboard

3. **Test Project Review**
   - In dashboard, click "Review Project"
   - Change status and add comments
   - Should update successfully

## 🔑 Default Credentials (Change in Production!)

```
Email: admin@juit.ac.in
Password: [Set your own during user creation]
```

## 📦 What You Get

### Frontend Features
- ✅ Project submission form (with backend)
- ✅ Admin login page (with auth)
- ✅ Admin dashboard (full CRUD)
- ✅ Project review system
- ✅ Status management

### Backend Features
- ✅ Database tables (5 tables)
- ✅ Row Level Security
- ✅ Authentication system
- ✅ Activity logging
- ✅ Pre-populated equipment data

## 🐛 Common Issues

**"Can't connect to Supabase"**
```bash
# Check .env file has correct values
# Restart dev server after changing .env
npm run dev
```

**"Login not working"**
```bash
# Verify user created in Supabase Auth
# Check email confirmation is disabled
# Use correct credentials
```

**"Projects not showing"**
```bash
# Check migration ran successfully
# Verify RLS policies enabled
# Check browser console for errors
```

## 📚 Full Documentation

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for:
- Detailed setup instructions
- Database schema details
- Security configuration
- API documentation
- Troubleshooting guide

## 🔗 Important Links

- **Supabase Dashboard**: https://app.supabase.com
- **Admin Login**: http://localhost:5173/admin
- **Admin Dashboard**: http://localhost:5173/admin/dashboard
- **Main Site**: http://localhost:5173

## 📝 Next Steps

1. Change default admin password
2. Add more admin users if needed
3. Configure email templates (optional)
4. Set up production environment
5. Deploy to hosting (Vercel/Netlify)

---

**Need Help?** Check BACKEND_SETUP.md or open an issue!
