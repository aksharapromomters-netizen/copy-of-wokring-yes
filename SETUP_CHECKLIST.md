# Setup Checklist

Use this checklist to ensure everything is set up correctly.

## Prerequisites

- [ ] Node.js v18+ installed
  ```bash
  node --version
  ```

- [ ] MongoDB v6+ installed
  ```bash
  mongosh --version
  ```

- [ ] MongoDB is running
  ```bash
  mongosh --eval "db.adminCommand('ping')"
  ```

## Installation Steps

- [ ] Clone/download the project
- [ ] Navigate to project directory
  ```bash
  cd copy-of-wokring-yes/copy-of-wokring-yes
  ```

- [ ] Install frontend dependencies
  ```bash
  npm install
  ```

- [ ] Install backend dependencies
  ```bash
  cd server
  npm install
  cd ..
  ```

## Configuration

- [ ] Check `.env.local` exists with correct values:
  ```env
  VITE_MONGODB_URI=mongodb://localhost:27017/etiquette_lms
  VITE_API_URL=http://localhost:3001/api
  VITE_JWT_SECRET=your-secret-key-change-in-production
  ```

- [ ] Create `server/.env` (optional, uses defaults if not present):
  ```env
  MONGODB_URI=mongodb://localhost:27017/etiquette_lms
  JWT_SECRET=your-secret-key-change-in-production
  PORT=3001
  ```

## Database Setup

- [ ] Create admin user
  ```bash
  cd server
  npm run create-admin
  cd ..
  ```

- [ ] Verify admin user was created
  ```bash
  mongosh etiquette_lms --eval "db.users.findOne({email: 'etiqettelms@gmail.com'})"
  ```

## Running the Application

- [ ] Start backend server (Terminal 1)
  ```bash
  cd server
  npm run dev
  ```
  Expected output: `Server running on port 3001` and `Connected to MongoDB`

- [ ] Start frontend (Terminal 2)
  ```bash
  npm run dev
  ```
  Expected output: `Local: http://localhost:5173/`

- [ ] Open browser to http://localhost:5173

- [ ] Login with admin credentials:
  - Email: `etiqettelms@gmail.com`
  - Password: `Akshara@123`

## Verification Tests

- [ ] Can login successfully
- [ ] Dashboard loads without errors
- [ ] Can view courses
- [ ] Can navigate to admin dashboard (if admin)
- [ ] Can create a new user (admin only)
- [ ] Can assign courses to users (admin only)
- [ ] Can view user profile
- [ ] Can complete a module
- [ ] XP updates correctly
- [ ] Can submit an assessment
- [ ] Progress is saved

## Troubleshooting

### MongoDB Issues

- [ ] MongoDB service is running
  ```bash
  # Windows: Check Services app
  # macOS: brew services list
  # Linux: sudo systemctl status mongod
  # Docker: docker ps
  ```

- [ ] Can connect to MongoDB
  ```bash
  mongosh
  ```

- [ ] Database exists
  ```bash
  mongosh --eval "show dbs"
  ```

### Backend Issues

- [ ] Port 3001 is available
  ```bash
  # Windows
  netstat -ano | findstr :3001
  
  # macOS/Linux
  lsof -i :3001
  ```

- [ ] Backend logs show no errors
- [ ] Can access http://localhost:3001/api/profiles (should return 401 Unauthorized)

### Frontend Issues

- [ ] Port 5173 is available
- [ ] Browser console shows no errors
- [ ] Network tab shows API calls to http://localhost:3001
- [ ] No CORS errors in console

### Authentication Issues

- [ ] JWT_SECRET is set in both frontend and backend
- [ ] Admin user exists in database
- [ ] Password is correct
- [ ] Token is being stored in localStorage
  - Open DevTools → Application → Local Storage → Check for `auth_token`

## Common Errors and Solutions

### "Cannot connect to MongoDB"
**Solution:** Start MongoDB service
```bash
# Windows: Start MongoDB service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Docker: docker start mongodb
```

### "Port 3001 already in use"
**Solution:** Kill the process or change port
```bash
# Find and kill process
# Windows: netstat -ano | findstr :3001, then taskkill /PID <pid> /F
# macOS/Linux: lsof -i :3001, then kill <pid>

# Or change port in server/.env
PORT=3002
```

### "Admin user already exists"
**Solution:** This is normal if you've already run create-admin. You can login with existing credentials.

### "Invalid credentials"
**Solution:** 
1. Verify admin user exists: `mongosh etiquette_lms --eval "db.users.findOne({email: 'etiqettelms@gmail.com'})"`
2. Try recreating admin user: Delete existing user first, then run create-admin again

### "CORS error"
**Solution:** Make sure backend is running and VITE_API_URL is correct in .env.local

### "Token expired"
**Solution:** Clear localStorage and login again
```javascript
// In browser console:
localStorage.clear();
```

## Production Checklist

- [ ] Use MongoDB Atlas or hosted MongoDB
- [ ] Set strong, random JWT_SECRET
- [ ] Update MONGODB_URI to production database
- [ ] Update VITE_API_URL to production API URL
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Add rate limiting
- [ ] Set up error logging
- [ ] Configure automated backups
- [ ] Set up monitoring
- [ ] Test all functionality in production
- [ ] Create production admin user
- [ ] Document production credentials securely

## Success Criteria

✅ All checkboxes above are checked
✅ Application runs without errors
✅ Can login and use all features
✅ Data persists across sessions
✅ No console errors

## Need Help?

Refer to:
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [MONGODB_MIGRATION.md](MONGODB_MIGRATION.md) - Detailed migration guide
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - Overview of changes

## Notes

- Default admin credentials should be changed in production
- JWT tokens expire after 7 days
- XP is cached in localStorage and synced with server
- All passwords are hashed with bcrypt (10 salt rounds)
