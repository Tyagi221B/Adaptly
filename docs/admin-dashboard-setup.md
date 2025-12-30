# Admin Dashboard Setup Guide

## Overview

The admin dashboard provides comprehensive analytics and management capabilities for the Adaptly platform. Admins can view and analyze all students, instructors, courses, enrollments, and quiz performance.

---

## Features Implemented

### ✅ Dashboard Pages

1. **Overview Dashboard** (`/admin/dashboard`)
   - Platform-wide statistics
   - Total students, instructors, courses, enrollments
   - Total quiz attempts and average platform rating
   - Trending courses by enrollment
   - Quick action links

2. **Students Management** (`/admin/students`)
   - List all students with search functionality
   - View enrollment count, quizzes passed, average scores
   - Individual student detail pages
   - Student profile, course progress, quiz statistics
   - Course reviews written by students

3. **Instructors Management** (`/admin/instructors`)
   - List all instructors with search functionality
   - View total courses, published courses, total students
   - Average ratings across all courses
   - Individual instructor detail pages
   - All courses created with detailed metrics

### ✅ Components Created

- `AdminSidebar` - Navigation sidebar
- `AdminHeader` - Top header with admin badge
- `StatCard` - Metric display cards
- `StudentsTable` - Students data table
- `InstructorsTable` - Instructors data table
- `SearchBar` - Search/filter component

### ✅ Backend

- **Admin Actions** (`actions/admin.actions.ts`)
  - `getPlatformStats()` - Platform-wide metrics
  - `getAllStudents()` - Student list with stats
  - `getStudentDetails()` - Individual student analytics
  - `getAllInstructors()` - Instructor list with stats
  - `getInstructorDetails()` - Individual instructor analytics
  - `getTrendingCourses()` - Top courses by enrollment

- **Type Definitions** (`types/admin.ts`)
  - Complete TypeScript interfaces for all admin data

### ✅ Security

- Admin-only routes protected in layout
- Redirects non-admin users to homepage
- Redirects unauthenticated users to login

---

## Setup Instructions

### 1. Make Yourself Admin

You need to manually update your user account in MongoDB to have admin role.

#### Option A: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Navigate to the `users` collection
4. Find your user document (search by email)
5. Click "Edit Document"
6. Change `role` from `"student"` or `"instructor"` to `"admin"`
7. Click "Update"

#### Option B: Using MongoDB Shell

```bash
# Connect to your MongoDB instance
mongosh "your-connection-string"

# Switch to your database
use adaptly

# Update your user to admin (replace with your email)
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

# Verify the update
db.users.findOne({ email: "your-email@example.com" }, { role: 1, email: 1 })
```

#### Option C: Using Mongoose Script

Create a file `scripts/make-admin.ts`:

```typescript
import mongoose from 'mongoose';
import User from '../database/user.model';

async function makeAdmin(email: string) {
  await mongoose.connect(process.env.MONGODB_URI!);

  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  );

  if (user) {
    console.log(`✅ User ${email} is now an admin`);
  } else {
    console.log(`❌ User ${email} not found`);
  }

  await mongoose.disconnect();
}

// Replace with your email
makeAdmin('your-email@example.com');
```

Run it:
```bash
npx ts-node scripts/make-admin.ts
```

---

### 2. Access the Admin Dashboard

1. Restart your Next.js development server (if running)
   ```bash
   npm run dev
   ```

2. Login with your admin account

3. Navigate to `/admin/dashboard`

4. You should see the admin panel!

---

## Routes

| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Overview dashboard with platform stats |
| `/admin/students` | List all students |
| `/admin/students/[id]` | Individual student details |
| `/admin/instructors` | List all instructors |
| `/admin/instructors/[id]` | Individual instructor details |

---

## Features by Page

### Dashboard (`/admin/dashboard`)

**Metrics Displayed:**
- Total students
- Total instructors
- Total courses (with published count)
- Total enrollments
- Total quiz attempts
- Average platform rating
- Total reviews

**Trending Courses:**
- Top 5 courses by enrollment
- Shows enrollment count, rating, and category

**Quick Actions:**
- Links to Students page
- Links to Instructors page

---

### Students Page (`/admin/students`)

**Table Columns:**
- Student name and avatar
- Email address
- Enrollment count
- Quizzes passed
- Average quiz score
- Join date

**Features:**
- Search by name or email
- Click row to view details

**Summary Section:**
- Total enrollments across all students
- Total quizzes passed across all students
- Platform average score

---

### Student Detail Page (`/admin/students/[id]`)

**Profile Section:**
- Name, avatar, email
- Join date, bio
- Social links (LinkedIn, GitHub)

**Stats Cards:**
- Total enrollments
- Quizzes passed (with pass rate)
- Average quiz score
- Total quiz attempts (with failed count)

**Course Enrollments:**
- All courses student is enrolled in
- Progress percentage per course
- Lectures completed vs total
- Quizzes passed per course
- Average quiz score per course

**Quiz Statistics:**
- Attempts by course
- Pass rate by course
- Recent attempts with scores

**Reviews:**
- All course reviews written
- Rating and comments

---

### Instructors Page (`/admin/instructors`)

**Table Columns:**
- Instructor name and avatar
- Email address
- Total courses created
- Published courses
- Total students (across all courses)
- Average rating (across all courses)
- Join date

**Features:**
- Search by name or email
- Click row to view details

**Summary Section:**
- Total courses across all instructors
- Published courses count
- Total students taught
- Platform average rating

---

### Instructor Detail Page (`/admin/instructors/[id]`)

**Profile Section:**
- Name, avatar, email
- Join date, bio
- Social links (LinkedIn, GitHub)

**Stats Cards:**
- Total courses created
- Published courses
- Total students (across all courses)
- Average rating (across all courses)

**Courses List:**
- All courses created by instructor
- Published/Draft status
- Category
- Enrollment count per course
- Total lectures per course
- Total quizzes per course
- Rating and reviews per course
- Creation date

---

## How Data is Calculated

### Student Statistics

```typescript
// Calculated in real-time from database:
enrollmentCount = Enrollment.countDocuments({ studentId })
quizzesPassedCount = QuizAttempt.countDocuments({ studentId, passed: true })
averageScore = avg(QuizAttempt.score where studentId)
passRate = (quizzesPassed / totalAttempts) * 100
```

### Instructor Statistics

```typescript
// Calculated in real-time from database:
totalCourses = Course.countDocuments({ instructorId })
publishedCourses = Course.countDocuments({ instructorId, isPublished: true })
totalStudents = Enrollment.countDocuments({ courseId in instructorCourses })
averageRating = avg(Course.averageRating where instructorId)
```

### Platform Statistics

```typescript
// Aggregated from all collections:
totalStudents = User.countDocuments({ role: "student" })
totalInstructors = User.countDocuments({ role: "instructor" })
totalCourses = Course.countDocuments()
totalEnrollments = Enrollment.countDocuments()
totalQuizAttempts = QuizAttempt.countDocuments()
averagePlatformRating = avg(CourseReview.rating)
```

---

## Performance Considerations

### Current Implementation

- **Simple Queries**: Uses multiple database queries per page
- **Works well for**: Up to 1000 students/instructors
- **May be slow for**: 10,000+ records

### Future Optimizations (if needed)

1. **Aggregation Pipelines**
   - Use MongoDB aggregation instead of multiple queries
   - Single query returns all calculated stats

2. **Denormalization**
   - Populate `User.stats` fields
   - Populate `Course.enrolledStudentsCount`
   - Pre-calculate aggregates on write

3. **Caching**
   - Cache platform stats (refresh every 5 minutes)
   - Cache student/instructor lists
   - Use Redis for fast reads

4. **Pagination**
   - Currently loads all records
   - Add offset/limit pagination for large datasets

---

## Security

### Authentication Check

```typescript
// In /app/admin/layout.tsx
const session = await getServerSession(authOptions);

if (!session) {
  redirect("/login"); // Not logged in
}

if (session.user.role !== "admin") {
  redirect("/"); // Not admin
}
```

### Only Admins Can Access

- All `/admin/*` routes protected by layout
- Server actions don't have additional checks (trusted)
- Could add admin verification in actions for extra security

---

## File Structure

```
app/admin/
├── layout.tsx                    → Admin layout with auth
├── dashboard/
│   └── page.tsx                  → Overview page
├── students/
│   ├── page.tsx                  → Students list
│   └── [id]/
│       └── page.tsx              → Student detail
└── instructors/
    ├── page.tsx                  → Instructors list
    └── [id]/
        └── page.tsx              → Instructor detail

components/admin/
├── admin-sidebar.tsx             → Navigation
├── admin-header.tsx              → Top bar
├── stat-card.tsx                 → Metric card
├── students-table.tsx            → Students table
├── instructors-table.tsx         → Instructors table
└── search-bar.tsx                → Search component

actions/
└── admin.actions.ts              → Server actions

types/
└── admin.ts                      → TypeScript types

database/
└── user.model.ts                 → Updated with admin role
```

---

## Troubleshooting

### "Access Denied" when accessing /admin

**Problem:** Getting redirected even though you're logged in

**Solution:**
1. Verify your user role in database is `"admin"`
2. Log out and log back in (to refresh session)
3. Check browser console for errors

### Stats showing 0 or incorrect numbers

**Problem:** Dashboard shows 0 students even though you have users

**Solution:**
- Check MongoDB connection
- Verify collections have data
- Check server console for errors in actions

### Search not working

**Problem:** Search doesn't filter results

**Solution:**
- Make sure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

### Page loading very slowly

**Problem:** Admin pages take >5 seconds to load

**Solution:**
- You may have many students/instructors
- Consider implementing pagination (see Optimizations above)
- Check MongoDB query performance

---

## Next Steps

### Immediate Enhancements

1. **Fix Denormalized Fields**
   - Start populating `User.stats`
   - Fix `Course.enrolledStudentsCount`
   - Will improve performance

2. **Add Pagination**
   - Students/Instructors lists with 50 per page
   - Previous/Next buttons

3. **Add Sorting**
   - Sort students by enrollment count
   - Sort instructors by rating

### Future Features

1. **Course Management**
   - Admin page to view all courses
   - Approve/unpublish courses
   - Edit course details

2. **Analytics Dashboard**
   - Charts showing growth over time
   - Quiz performance trends
   - Popular course categories

3. **User Management**
   - Disable/enable user accounts
   - Change user roles
   - Send notifications

4. **Export Functionality**
   - Export student list to CSV
   - Export quiz analytics
   - Generate reports

---

## Database Schema Changes

### User Model Updated

```typescript
// database/user.model.ts
role: {
  type: String,
  enum: {
    values: ["student", "instructor", "admin"], // Added admin
    message: "Role must be student, instructor, or admin",
  },
  default: "student",
}
```

**Breaking Change:** No
**Migration Needed:** No (MongoDB is schema-flexible)
**Impact:** Only affects new admin users created

---

## Support

If you encounter issues:

1. Check this documentation first
2. Review server console for errors
3. Check MongoDB for data integrity
4. Review `docs/database-analysis.md` for data insights

---

## Summary

You now have a fully functional admin dashboard! 🎉

**What you can do:**
- ✅ View all students and their progress
- ✅ View all instructors and their courses
- ✅ See platform-wide statistics
- ✅ Search and filter users
- ✅ Track quiz performance
- ✅ Monitor course ratings

**Next:**
- Make yourself admin in MongoDB
- Access `/admin/dashboard`
- Explore the analytics!

Happy analyzing! 📊
