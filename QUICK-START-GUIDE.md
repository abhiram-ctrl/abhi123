# DISASTER GUARDIAN - COMPLETE SETUP & RUN GUIDE

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies (First Time Only)
```powershell
cd backend
npm install

cd ../disaster-guardian
npm install
```

### 2. Seed Database (First Time Only)
```powershell
cd backend
$env:MONGO_URI="mongodb://127.0.0.1:27017/disaster-guardian"
node seed.js
node seed-test-users.js
node seed-demo-data.js
```

### 3. Start Everything
**Option A - Automated (Recommended):**
```powershell
# From project root
.\START-SERVERS.ps1
```

**Option B - Manual:**
```powershell
# Terminal 1 - Backend
cd backend
$env:MONGO_URI="mongodb://127.0.0.1:27017/disaster-guardian"
node index.js

# Terminal 2 - Frontend
cd disaster-guardian
$env:VITE_API_URL="http://localhost:5000"
npm run dev
```

## 📍 URLs
- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:5173 (or next available port)
- **Health Check:** http://localhost:5000/api/health

## 🔑 Test Credentials

### Admin
- Email: `admin@disasterguardian.com`
- Password: `admin123`
- Access: Full system administration

### Citizen
- Email: `citizen@test.com`
- Password: `citizen123`
- Features: Report SOS, Report Risks, View History

### Volunteer
- Email: `volunteer@test.com`
- Password: `volunteer123`
- Status: Pre-verified
- Features: View/Accept Incidents, Real-time Notifications

## 🗂️ Database Structure

### Collections
1. **users** - All user accounts (admin, citizen, volunteer)
2. **incidents** - SOS and Risk reports
3. **volunteerprofiles** - Volunteer verification status
4. **officers** - Emergency responders (NDRF, Police, NGO, etc.)
5. **donations** - Donation records
6. **contacts** - Emergency contacts

### Sample Data Seeded
- ✅ 1 Admin user
- ✅ 2 Test users (citizen + volunteer)
- ✅ 1 Verified volunteer profile
- ✅ Multiple demo incidents with coordinates

## 🔧 Maintenance Scripts

### Re-seed Admin Only
```powershell
cd backend
node reseed-admin.js
```

### Clean Duplicate Users
```powershell
cd backend
node cleanup-db.js
```

### Optimize Database
```powershell
cd backend
node optimize-db.js
```

### Add More Demo Data
```powershell
cd backend
node seed-demo-data.js
```

## 🐛 Troubleshooting

### Backend Won't Start
1. Check MongoDB is running: `mongo --version`
2. Kill old processes: `taskkill /F /IM node.exe`
3. Check port 5000: `netstat -ano | findstr :5000`

### Frontend Shows 404
1. Check the exact port Vite printed (might be 5174 if 5173 busy)
2. Press `u` in Vite terminal to show URL
3. Ensure VITE_API_URL points to backend

### Forgot Password Not Working
- Fixed: All `/api/forgot-password/*` endpoints now properly wired
- Test: Navigate to `/forgot-password` page

### Database Connection Failed
- Ensure MongoDB is running on port 27017
- Check MONGO_URI in `.env`: `mongodb://127.0.0.1:27017/disaster-guardian`

## 📦 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/signup` - Register
- `POST /api/forgot-password/request-otp` - Request password reset
- `POST /api/forgot-password/verify-otp` - Verify OTP
- `POST /api/forgot-password/reset-password` - Reset password

### Incidents
- `GET /api/incidents` - List all incidents
- `GET /api/incidents/:id` - Get incident details
- `POST /api/incidents` - Create incident
- `PUT /api/incidents/:id` - Update incident

### Volunteers
- `GET /api/volunteers` - List volunteers (filter by status)
- `GET /api/volunteers/incidents/new` - Unassigned incidents
- `GET /api/volunteers/user/:userId/incidents` - Assigned to user
- `POST /api/volunteers/incidents/:id/accept` - Accept incident
- `PUT /api/volunteers/incidents/:id/status` - Update status

### Admin
- `GET /api/volunteers/pending` - Pending verification
- `PUT /api/volunteers/:id/verify` - Verify volunteer
- `GET /api/officers` - List officers
- `GET /api/donations` - List donations

## 🎯 Features Working

### ✅ Completed & Tested
- [x] User authentication (Login/Signup)
- [x] Forgot password flow (Email/Phone OTP)
- [x] Citizen dashboard with incident reporting
- [x] Volunteer dashboard with incident assignment
- [x] Admin dashboard with statistics
- [x] Real-time socket.io notifications
- [x] Heatmap visualization (MapLibre GL)
- [x] Language toggle (English/Telugu)
- [x] Dark blue/teal theme applied globally
- [x] Database fully seeded with test data
- [x] All API endpoints wired and responding

### 🗺️ Heatmap Features
- Toggle between Map and List views
- Show incidents with color-coded severity
- Display verified volunteers as helpers
- Real-time location tracking
- Distance calculations

### 🌐 Internationalization
- English (default)
- Telugu (తెలుగు)
- 100+ translation keys
- Switches across all admin pages

## 💾 Data Flow

```
User Login
    ↓
Role Detection (citizen/volunteer/admin)
    ↓
Dashboard Load
    ↓
Fetch from MongoDB:
    - Incidents (filtered by role)
    - Volunteers (if admin/volunteer)
    - Officers (if admin)
    - Stats aggregation
    ↓
Real-time Updates (Socket.io)
    ↓
Render Components (React)
```

## 🔐 Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for authentication
- OTP expires in 5 minutes
- Dev mode logs OTP to console
- CORS enabled for localhost development

## 📝 Notes

- All routes use `/api` prefix
- Socket.io on same port as backend (5000)
- Vite auto-picks next available port if 5173 busy
- MapLibre GL requires coordinates in [lng, lat] format
- MongoDB uses `_id` (ObjectId), frontend normalizes to `id`

---

**Last Updated:** December 19, 2025
**Version:** 1.0.0
**Status:** ✅ Fully Operational
