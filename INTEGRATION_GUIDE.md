# 🔗 Frontend-Backend Integration Guide

## ✅ What Was Done

### 1. **LoginPage.jsx** - Citizen/Volunteer Login ✓
- **BEFORE**: Using mock auth service
- **AFTER**: Connected to real backend API at `http://localhost:5000/api/auth/login`
- **What it does**: 
  - Validates email and password
  - Sends to backend
  - Stores token and user data in localStorage
  - Redirects to citizen or volunteer dashboard based on role

### 2. **SignupPage.jsx** - Citizen/Volunteer Signup ✓
- **BEFORE**: Using mock data, creating fake users
- **AFTER**: Connected to real backend API at `http://localhost:5000/api/auth/signup`
- **What it does**:
  - Collects: name, email, phone, password, role
  - Sends to backend
  - Redirects to login page after successful signup
  
### 3. **AdminLoginPage.jsx** - Admin Login ✓
- **BEFORE**: Using hardcoded mock credentials
- **AFTER**: Connected to real backend API
- **What it does**:
  - Validates that role is "admin" after login
  - Stores admin token and data
  - Redirects to admin dashboard

### 4. **Admin User Created** ✓
- Email: `admin@disasterguardian.com`
- Password: `admin123`
- Already stored in MongoDB

---

## 🚀 Current Status

### Running Services:
✅ **Frontend**: http://localhost:5174  
✅ **Backend**: http://localhost:5000  
✅ **MongoDB**: Connected (Atlas)  

---

## 🧪 How to Test

### **Test 1: Admin Login** 🔐
1. Go to http://localhost:5174 → Admin Login
2. Email: `admin@disasterguardian.com`
3. Password: `admin123`
4. Should redirect to `/admin/dashboard`

### **Test 2: Citizen Signup & Login** 👤
1. Go to Landing Page → Select "Citizen"
2. Click "Sign Up"
3. Fill form:
   - Name: `John Doe`
   - Email: `citizen@test.com`
   - Phone: `1234567890`
   - Password: `password123`
4. Click "Sign Up" → Should redirect to Login
5. Login with same email & password
6. Should redirect to `/citizen/dashboard`

### **Test 3: Volunteer Signup & Login** 🆘
1. Go to Landing Page → Select "Volunteer"
2. Click "Sign Up"
3. Fill form:
   - Name: `Jane Smith`
   - Email: `volunteer@test.com`
   - Phone: `9876543210`
   - Password: `password123`
4. Click "Sign Up" → Should redirect to Login
5. Login with email `volunteer@test.com` & password `password123`
6. Should redirect to `/volunteer/dashboard`

---

## 🔧 How It Works (ELI5)

### **The Flow** 📱 → 💻 → 🗄️

1. **User fills form on frontend**
   - Frontend = the website they see

2. **Frontend sends data to backend**
   - Backend = the server that processes data
   - Uses API endpoint like `/api/auth/login`

3. **Backend checks database (MongoDB)**
   - Verifies email exists
   - Checks if password is correct
   - Returns token if valid

4. **Frontend stores token**
   - Token = proof of login
   - Stored in browser's localStorage
   - Used for all future requests

5. **Frontend redirects user**
   - Goes to their dashboard
   - Different for Admin/Citizen/Volunteer

---

## 📋 API Endpoints Used

### **POST** `/api/auth/signup`
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone": "1234567890",
  "password": "password123",
  "role": "citizen|volunteer|admin"
}
```
**Returns**: `{ message: "Signup success" }`

### **POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Returns**: 
```json
{
  "message": "Login success",
  "token": "jwt-token-here",
  "role": "citizen|volunteer|admin",
  "id": "user-id"
}
```

---

## 🐛 Error Handling

All pages now have proper error messages:
- ❌ "User not found" → Email doesn't exist
- ❌ "Wrong password" → Password incorrect
- ❌ "Invalid admin credentials" → Admin role required
- ✅ Success messages are shown on correct login

---

## 📂 Files Modified

1. `src/pages/LoginPage.jsx` - Real API integration
2. `src/pages/SignupPage.jsx` - Real API integration
3. `src/pages/AdminLoginPage.jsx` - Real API integration
4. `backend/seed.js` - Admin user creation script

---

## ⚠️ Important Notes

- Backend must be running on http://localhost:5000
- Frontend must be on http://localhost:5174
- MongoDB must be connected
- JWT token stored in localStorage after successful login
- Each user role (admin/citizen/volunteer) redirects to different dashboard

---

## Next Steps (If Needed)

- [ ] Add forgot password functionality
- [ ] Add email verification
- [ ] Add refresh token logic
- [ ] Add logout functionality
- [ ] Integrate citizen dashboard with backend
- [ ] Integrate volunteer dashboard with backend
- [ ] Integrate admin dashboard with backend

---

**Last Updated**: December 17, 2025  
**Status**: ✅ READY TO TEST
