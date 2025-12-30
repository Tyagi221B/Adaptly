# Admin Setup Guide - isAdmin Field Approach

**Date:** December 26, 2024
**Implementation:** isAdmin boolean field

---

## 🎉 What Changed

We implemented the **`isAdmin` boolean field** approach instead of a separate "admin" role!

### **Before:**
```typescript
role: "student" | "instructor" | "admin"  // ❌ Mutually exclusive
```

### **After:**
```typescript
role: "student" | "instructor"  // User's primary function
isAdmin: boolean                // Admin superpowers flag
```

---

## ✅ Benefits

1. **You can be BOTH student AND admin**
   - Keep your student account with all enrollments
   - Access admin dashboard for analytics
   - No need to switch accounts

2. **Flexible Permissions**
   - Student with admin powers = can learn + manage platform
   - Instructor with admin powers = can teach + manage platform

3. **Clean Separation**
   - `role` = what you DO (student/instructor)
   - `isAdmin` = extra PERMISSIONS (view analytics)

---

## 🔧 How to Set Up Your Account

### **Step 1: Update Your Account in MongoDB**

#### **Option A: MongoDB Compass (GUI)**

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `users` collection
4. Find your user (search by email)
5. Click "Edit Document"
6. **Make these changes:**
   ```json
   {
     "role": "student",      // Keep as student (or instructor)
     "isAdmin": true         // Add this line!
   }
   ```
7. Click "Update"

#### **Option B: MongoDB Shell**

```javascript
// Connect to MongoDB
mongosh "your-connection-string"

// Switch to database
use adaptly

// Update your account
db.users.updateOne(
  { email: "your-email@example.com" },
  {
    $set: {
      role: "student",     // Keep your student role
      isAdmin: true        // Add admin flag
    }
  }
)

// Verify the change
db.users.findOne(
  { email: "your-email@example.com" },
  { name: 1, email: 1, role: 1, isAdmin: 1 }
)
```

**Expected Output:**
```json
{
  "_id": ObjectId("..."),
  "name": "Your Name",
  "email": "your-email@example.com",
  "role": "student",
  "isAdmin": true
}
```

---

### **Step 2: Logout and Login**

**IMPORTANT:** Your session is cached! You must refresh it.

1. **Logout** from your app (click logout button)
2. **Login** again with the same credentials
3. Your new session will include `isAdmin: true`

---

### **Step 3: Verify Your Session**

Visit this URL in your browser:
```
http://localhost:3000/api/debug/session
```

**You should see:**
```json
{
  "authenticated": true,
  "session": {
    "user": {
      "id": "...",
      "name": "Your Name",
      "email": "your-email@example.com",
      "role": "student",      // ← Your student role
      "isAdmin": true         // ← Admin powers!
    }
  }
}
```

If `isAdmin` is `false` or missing, **logout and login again**.

---

### **Step 4: Access Admin Dashboard**

Navigate to:
```
http://localhost:3000/admin/dashboard
```

**You should now see the admin dashboard!** 🎉

---

## 🎯 What You Can Do Now

### **As Student (role: "student")**
- ✅ Access `/student/dashboard`
- ✅ Enroll in courses
- ✅ Take quizzes
- ✅ View your progress
- ✅ Write reviews

### **As Admin (isAdmin: true)**
- ✅ Access `/admin/dashboard`
- ✅ View all students
- ✅ View all instructors
- ✅ See platform analytics
- ✅ See yourself in the student list!

### **Both!**
You can now:
- Learn courses as a student
- Check analytics as an admin
- All in one account!

---

## 📊 Different Configurations

### **Regular Student**
```json
{
  "role": "student",
  "isAdmin": false
}
```
- ✅ Student dashboard
- ❌ Admin dashboard

### **Student + Admin (You!)**
```json
{
  "role": "student",
  "isAdmin": true
}
```
- ✅ Student dashboard
- ✅ Admin dashboard
- ✅ Keep all enrollments

### **Instructor + Admin**
```json
{
  "role": "instructor",
  "isAdmin": true
}
```
- ✅ Instructor dashboard
- ✅ Admin dashboard
- ✅ Create courses + manage platform

### **Regular Instructor**
```json
{
  "role": "instructor",
  "isAdmin": false
}
```
- ✅ Instructor dashboard
- ❌ Admin dashboard

---

## 🔍 Troubleshooting

### **Problem: Can't access admin dashboard**

**Check 1: Verify your DB**
```javascript
db.users.findOne(
  { email: "your@email.com" },
  { role: 1, isAdmin: 1 }
)
```

Should show:
```json
{
  "role": "student",  // or "instructor"
  "isAdmin": true     // Must be true!
}
```

**Check 2: Verify your session**
Visit: `http://localhost:3000/api/debug/session`

Should show:
```json
{
  "session": {
    "user": {
      "isAdmin": true  // ← Must be true!
    }
  }
}
```

**If isAdmin is false:**
1. Double-check MongoDB (maybe update didn't save)
2. Logout completely
3. Clear browser cookies (optional)
4. Login again

---

### **Problem: Lost access to student dashboard**

This shouldn't happen! If it does:

**Check your role in DB:**
```javascript
db.users.findOne(
  { email: "your@email.com" },
  { role: 1 }
)
```

Should be `"student"` or `"instructor"`, NOT something else.

**Fix it:**
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "student" } }
)
```

Then logout and login again.

---

### **Problem: Session shows old data**

**Solution:** Clear cookies and login again

1. **Chrome/Edge:**
   - Open DevTools (F12)
   - Application tab → Cookies
   - Delete all cookies for localhost
   - Close DevTools
   - Refresh page
   - Login again

2. **Firefox:**
   - Open DevTools (F12)
   - Storage tab → Cookies
   - Delete all cookies
   - Refresh and login

3. **Safari:**
   - Develop → Show Web Inspector
   - Storage tab → Cookies
   - Delete cookies
   - Refresh and login

---

## 🚀 Quick Commands Reference

### **Make yourself student + admin:**
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "student", isAdmin: true } }
)
```

### **Make someone else admin (without changing their role):**
```javascript
db.users.updateOne(
  { email: "other@email.com" },
  { $set: { isAdmin: true } }
)
```

### **Remove admin access:**
```javascript
db.users.updateOne(
  { email: "someone@email.com" },
  { $set: { isAdmin: false } }
)
```

### **Find all admins:**
```javascript
db.users.find(
  { isAdmin: true },
  { name: 1, email: 1, role: 1, isAdmin: 1 }
)
```

---

## 📝 Files Changed

1. ✅ `database/user.model.ts` - Added `isAdmin` field, removed "admin" from role enum
2. ✅ `types/next-auth.d.ts` - Added `isAdmin` to session types
3. ✅ `lib/auth-config.ts` - Include `isAdmin` in JWT and session
4. ✅ `app/admin/layout.tsx` - Check `isAdmin` instead of role
5. ✅ `app/api/debug/session/route.ts` - Show `isAdmin` in debug output

---

## ✨ Summary

**Old Way:**
- Role = "admin" → Access admin dashboard
- Role = "student" → No admin access
- Can't be both

**New Way:**
- Role = "student" + isAdmin = true → Student features + Admin dashboard
- Role = "instructor" + isAdmin = true → Instructor features + Admin dashboard
- Can be both!

---

## 🎯 Next Steps

1. ✅ Update your account in MongoDB
2. ✅ Logout and login
3. ✅ Check `/api/debug/session`
4. ✅ Access `/admin/dashboard`
5. ✅ Enjoy both student and admin features! 🎉

---

**Need help?** Check the troubleshooting section above!

**Happy analyzing! 📊**
