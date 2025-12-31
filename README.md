# Adaptly

An AI-powered Learning Management System built with Next.js 16, TypeScript, and MongoDB.

## Demo Video

[![Adaptly Demo](https://res.cloudinary.com/asmitdemocloud/image/upload/v1766749576/Screenshot_2025-12-26_at_4.05.57_PM_b2nvg1.png)](https://www.youtube.com/watch?v=pQOskkCH1_g)

**[Watch the full demo on YouTube](https://www.youtube.com/watch?v=pQOskkCH1_g)**

## What is this?

Adaptly is a full-stack LMS that goes beyond basic CRUD operations. The main differentiator is the AI integration throughout the learning experience - from automated quiz generation to context-aware chat assistance during lectures and after assessments.

## Why I built this

Most LMS platforms are pretty static. Students watch lectures, take quizzes, and that's it. I wanted to build something where AI actually helps students learn - not just as a gimmick, but as a genuinely useful feature.

The key insight: students need help at different stages of learning. During lectures, they might need clarification. During quizzes, they should be on their own (academic integrity). After quizzes, they need to understand their mistakes. So I built the AI chat to adapt to these different contexts.

## Tech Stack

- **Next.js 16** with App Router, Server Components, and Server Actions
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **NextAuth.js** for authentication
- **Tailwind CSS** + shadcn/ui for UI
- **Groq** (llama-3.3-70b) via Vercel AI SDK for AI features
- **Cloudinary** for image uploads

## Key Features

### For Instructors

**Course Management:**
Create courses with lectures (markdown-based content with syntax highlighting). The interesting part is the AI quiz generation - you can generate multiple-choice quizzes directly from lecture content. It works surprisingly well and saves a lot of time.

**Student Analytics:**
Track your students' progress across all your courses:
- View all students enrolled in your courses (aggregated view)
- Per-student analytics: enrollment count, quiz performance, average scores
- Detailed drill-down: see individual student progress in specific courses
- Quiz attempt history with scores and pass/fail tracking
- Enrollment dates and completion percentages

Built with MongoDB aggregation pipelines for instant loading even with hundreds of students.

### For Students

The learning flow is:
1. Enroll in courses from the discover page
2. Read lectures with the AI chat sidebar available (desktop) or floating button (mobile)
3. Take quizzes on a separate page (no AI access here - academic integrity)
4. View results with AI-generated feedback on mistakes
5. Continue chatting with AI on the results page to understand concepts better

### For Admins

**Platform Analytics Dashboard:**
- Real-time statistics: total students, instructors, courses, enrollments
- Course distribution metrics (published vs draft)
- Enrollment trends and platform growth

**Student Management:**
- View all students with comprehensive analytics
- Per-student metrics: enrollment count, quiz performance, average scores
- Detailed student profiles with course-by-course progress
- Quiz attempt history and performance tracking

**Instructor Management:**
- View all instructors with performance metrics
- Per-instructor analytics: total courses, published courses, student reach
- Average course ratings across instructor's portfolio
- Detailed instructor profiles with student analytics

All admin views optimized with MongoDB aggregation pipelines (200x query reduction - from 201 queries to 1 query for 100 students).

### The AI Chat Assistant

This is the main feature that makes Adaptly different. Here's how it works:

**On Lecture Pages:**
- Sidebar on desktop (VS Code style), floating button on mobile
- AI has context of the lecture content
- Chat history persists in localStorage per lecture
- Can collapse it when you want to focus

**During Quizzes:**
- AI is completely disabled (separate page, no chat component rendered)
- Full-screen quiz interface

**On Results Pages:**
- AI chat comes back with enhanced context
- Knows which questions you got wrong
- Can explain specific mistakes
- Conversation continues from the lecture page (same localStorage key)

The context enhancement on results pages was tricky to get right. I build a comprehensive context string that includes:
- Original lecture content
- Quiz score and pass/fail status
- Questions the student got wrong
- Student's answers vs correct answers
- AI-generated remedial feedback

This way, students can ask things like "Why was my answer to question 2 wrong?" and the AI actually knows what they're talking about.

## Architecture Decisions

### Quiz Flow Separation

I originally had the quiz embedded in the lecture page, but that created problems:
1. AI chat was accessible during quizzes (cheating risk)
2. The lecture content was still visible (distracting)
3. No clear mental separation between learning and testing

So I moved quizzes to a dedicated route (`/lectures/[id]/quiz`). This gave me:
- Physical separation prevents AI access
- Full-screen focus mode
- Clean URL structure
- Easy to add features like timers or pause/resume later

### AI Chat Context Strategy

I had to decide whether quiz results should have a separate chat history or continue from the lecture. I went with continuing the conversation because:
- It's all part of the same learning journey for that lecture
- Students might reference earlier questions
- Better UX (no need to re-ask questions)

The trade-off is the localStorage can get large, but for a single lecture's conversation, it's manageable.

### Component Architecture

I use a dual-mode pattern for the AI chat component - same component renders differently based on mode prop:
- `mode="sidebar"` for desktop lecture/results pages
- `mode="floating"` for mobile

This keeps the logic in one place while adapting the UI to context.

## Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd adaptly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/adaptly
NEXTAUTH_SECRET=generate-a-random-string-min-32-chars
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Get a Groq API key from [console.groq.com](https://console.groq.com) (it's free).
Cloudinary is also free tier for development.

## Project Structure

```
app/
├── api/
│   ├── auth/           # NextAuth endpoints
│   └── chat/           # AI chat endpoint
├── instructor/         # Instructor dashboard
├── student/
│   ├── courses/[courseId]/lectures/[lectureId]/
│   │   ├── page.tsx          # Lecture view + AI chat
│   │   ├── quiz/             # Dedicated quiz page
│   │   └── quiz-result/      # Results + AI chat
│   ├── dashboard/
│   └── discover/
components/
├── ui/                 # shadcn components
├── instructor/
│   └── quiz-generator.tsx
└── student/
    ├── ai-chat-assistant.tsx  # Dual-mode chat
    ├── quiz-taker.tsx
    └── mark-complete-button.tsx
actions/                # Server Actions for data mutations
lib/
├── ai.ts              # Groq integration
├── auth-config.ts     # NextAuth config
├── rate-limit.ts      # Rate limiting for AI endpoints
└── validations/       # Zod schemas
models/                # Mongoose models
```

## How the AI Works

### 1. Quiz Generation

Uses structured output with Zod schemas to ensure the AI returns properly formatted quiz questions. The prompt asks for multiple-choice questions with explanations based on the lecture content.

Code: `lib/ai.ts` → `generateQuizQuestions()`

### 2. Remedial Feedback

After a quiz, if the student got questions wrong, the system generates personalized feedback. It takes the lecture content and the wrong answers, then asks the AI to explain what the student needs to focus on.

This has rate limiting (3 requests/minute per user) to prevent abuse.

Code: `actions/quiz-attempt.actions.ts` → `generateRemedialContent()`

### 3. Chat Assistant

The chat endpoint is a simple POST route that takes:
- Chat history
- Lecture content
- Lecture title

On results pages, the lecture content is enhanced with quiz context before being sent.

The system prompt tells the AI to act as a teaching assistant and stay focused on the lecture material.

Code: `app/api/chat/route.ts`

## Performance Optimizations

### N+1 Query Elimination

Rewrote 8 high-traffic functions to use MongoDB aggregation pipelines instead of loops:

**The Problem (Before):**
```typescript
// Getting 100 students with stats = 201 database queries!
const students = await User.find({ role: 'student' }); // 1 query

for (const student of students) {
  const enrollments = await Enrollment.find({ studentId: student._id }); // 100 queries
  const quizAttempts = await QuizAttempt.find({ studentId: student._id }); // 100 queries
  // Calculate stats...
}
```

**The Solution (After):**
```typescript
// Getting 100 students with stats = 1 aggregation query
const students = await User.aggregate([
  { $match: { role: 'student' } },
  { $lookup: { from: 'enrollments', localField: '_id', foreignField: 'studentId', as: 'enrollments' } },
  { $lookup: { from: 'quizattempts', localField: '_id', foreignField: 'studentId', as: 'quizAttempts' } },
  { $addFields: {
      enrollmentCount: { $size: '$enrollments' },
      quizzesPassedCount: { $size: { $filter: { input: '$quizAttempts', cond: { $eq: ['$$this.passed', true] } } } },
      averageScore: { $avg: '$quizAttempts.score' }
  }}
]);
```

**Results:**
- `getAllStudents()`: 201 queries → 1 query (200x reduction)
- `getAllInstructors()`: 101 queries → 1 query (100x reduction)
- `getMyEnrollments()`: 11 queries → 1 query
- `getPublishedCourses()`: 101 queries → 1 query
- Total: **443+ queries eliminated** across the platform

### Next.js Caching Layer

Implemented server-side caching using `unstable_cache` from Next.js 16:

| Function | TTL | Reasoning |
|----------|-----|-----------|
| `getLectureForStudent()` | 1 hour | Static markdown content, highest traffic from students re-reading |
| `getCourseLectures()` | 30 min | Sidebar navigation, only changes when lectures added/removed |
| `getPublishedCourses()` | 5 min | Catalog updates when instructors publish |
| `getFeaturedCourses()` | 10 min | Top 6 courses by rating, changes very slowly |
| `getMyEnrollments()` | 1 min | Student dashboard, needs freshness for progress updates |
| `getAvailableCoursesForStudent()` | 2 min | Browse unenrolled courses, updates on enrollment |

**Cache Invalidation:**

Automatic cache busting on data mutations using `revalidateTag()`:

```typescript
// When student enrolls in a course
export async function enrollInCourse(studentId, courseId) {
  await Enrollment.create({ studentId, courseId });
  revalidateTag('enrollments', 'max'); // Clears enrollment caches
}

// When instructor publishes a course
export async function toggleCoursePublish(courseId) {
  await course.save();
  revalidateTag('courses', 'max');           // Clears all course caches
  revalidateTag('published-courses', 'max'); // Clears catalog cache
  revalidateTag('featured-courses', 'max');  // Clears homepage cache
}

// When lecture is updated
export async function updateLecture(lectureId, data) {
  await lecture.save();
  revalidateTag('lectures', 'max'); // Clears lecture content caches
}
```

**Impact:**
- First page load: 340ms (database query + aggregation)
- Cached page load: 82ms (read from `.next/cache`)
- **4x performance improvement** on cache hits
- Cache stored in `.next/cache` directory (persists across server restarts)
- Uses Next.js 16's stale-while-revalidate semantics

**Key Implementation Details:**
- `unstable_cache` automatically includes function parameters in cache keys (student-safe)
- Per-student caching: `getMyEnrollments('student123')` has separate cache from `getMyEnrollments('student456')`
- All caches validated working in development with console logging tests

## Testing

This project includes comprehensive automated tests to ensure code quality and reliability.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-reruns when files change)
npm test:watch

# Run tests with coverage report
npm test:coverage
```

### Test Coverage

- **Unit Tests**: Rate limiting, validation schemas, utility functions
- **Component Tests**: Footer, UI components
- **Integration Tests**: Authentication flows, course management

### CI/CD Pipeline

Tests run automatically on every push to `main` via GitHub Actions:
- ✅ Linting checks
- ✅ All test suites
- ✅ Build verification

**Deployment Status**: Automatic deployment configured with Vercel. Every push to `main` triggers:
1. GitHub Actions CI (tests & build)
2. Vercel deployment (on CI success)

## Real-World Considerations

**Security:**
- Input validation with Zod on all forms and API routes
- Rate limiting on AI endpoints (prevents cost overruns)
- NextAuth for session-based auth with HTTP-only cookies
- Role-based access control (instructors can't access student quiz attempts)

**Performance:**
- Server Components where possible (smaller client bundles)
- **Next.js caching with unstable_cache (6 functions cached)**
  - Course catalog: 5-10 min TTL
  - Lecture content: 1 hour TTL (highest traffic)
  - Enrollments: 1 min TTL with auto-invalidation
  - 4x faster on cache hits (340ms → 82ms)
- **MongoDB aggregation pipelines (N+1 query elimination)**
  - 443+ queries eliminated across 8 functions
  - 200x query reduction on admin dashboard
  - Sub-second load times even with hundreds of records
- MongoDB indexes on frequently queried fields
- Cloudinary for optimized image delivery
- LocalStorage for chat (avoids unnecessary API calls)

**Error Handling:**
- Try-catch in all Server Actions
- Toast notifications for user-facing errors
- Graceful degradation (if AI fails, quiz generation falls back to manual)

## What Could Be Improved

If I had more time:
- Support for video lectures
- Better mobile experience for quiz taking
- Pagination for large course lists
- Search and filtering on discover page
- Real-time notifications for quiz submissions
- Bulk course operations for instructors

## Assignment Requirements

This project addresses all the mandatory requirements:
- ✓ Next.js 16 with TypeScript
- ✓ MongoDB database
- ✓ Full CRUD operations on courses, lectures, quizzes, enrollments
- ✓ Responsive UI with Tailwind + shadcn/ui
- ✓ Deployed to Vercel (zero-config)
- ✓ Code optimization (Server Components, lazy loading)
- ✓ Real-world considerations (security, error handling, scalability)

Optional features implemented:
- ✓ NextAuth authentication with role-based access
- ✓ AI integration (quiz generation, chat assistant, remedial feedback)
- ✓ Comprehensive testing suite with CI/CD pipeline

### Assignment Part 2: Analytics & Caching

**Admin Dashboard Enhancements:**
- ✓ Platform analytics (students, instructors, courses, enrollments)
- ✓ Student progress tracking (enrollments, quiz stats, average scores)
- ✓ Instructor analytics (course counts, student reach, ratings)
- ✓ Detailed drill-down views for individual students and instructors
- ✓ Real-time statistics dashboard

**Instructor Dashboard Analytics:**
- ✓ View all students enrolled across instructor's courses
- ✓ Per-student analytics (quiz performance, completion rates)
- ✓ Course-by-course student progress tracking
- ✓ Quiz attempt history with detailed scoring

**Caching & Revalidation (using next/cache):**
- ✓ Implemented `unstable_cache` on 6 high-traffic student functions
- ✓ Automatic cache invalidation with `revalidateTag()` on data mutations
- ✓ Per-student cache keys (privacy-safe, auto-generated by Next.js)
- ✓ 4x performance improvement (340ms → 82ms on cache hits)
- ✓ Stale-while-revalidate semantics with Next.js 16 API

**Performance Optimizations:**
- ✓ MongoDB aggregation pipelines for N+1 query elimination
- ✓ 443+ queries eliminated across 8 functions
- ✓ 200x query reduction on admin dashboard (201 → 1 query)
- ✓ Sub-second load times even with hundreds of records

## ♿ Accessibility

Adaptly follows WCAG 2.1 Level AA guidelines to ensure the platform is accessible to all users:

**Core Features:**
- **Keyboard Navigation** - Full keyboard support using Tab, Enter, Esc, and Arrow keys
- **Screen Reader Compatible** - Proper ARIA labels, landmarks, and semantic HTML
- **Focus Management** - Clear focus indicators and logical tab order
- **Form Accessibility** - Labeled inputs with error announcements (aria-live regions)
- **Color Contrast** - Meets WCAG AA contrast ratios (verified)
- **Skip Navigation** - Skip to main content link for keyboard users
- **Alternative Text** - Descriptive alt text for all meaningful images
- **Live Regions** - Dynamic content changes announced to assistive tech
- **Responsive Design** - Works across all screen sizes and devices

**Testing Tools:**
- ESLint jsx-a11y plugin for linting accessibility issues
- axe-core for automated runtime accessibility testing (dev mode)
- Manual keyboard navigation testing
- Color contrast verification

[View Full Accessibility Statement](/accessibility)

## Known Limitations

- No email verification (would need email service)
- Quiz attempts can't be deleted (by design for audit trail)
- AI responses can sometimes be verbose
- No offline support
- Chat history could get large over time (would need cleanup strategy)

## Developer

Built by Asmit Tyagi

- GitHub: [https://github.com/Tyagi221B/Adaptly]
- LinkedIn: [https://www.linkedin.com/in/asmit-tyagi-0482081ba/]

## License

MIT - use this however you want for learning

---

That's pretty much it. The codebase is relatively straightforward - Next.js 16 patterns throughout, TypeScript for safety, MongoDB for data, Groq for AI. The interesting part is how these pieces come together to create an adaptive learning experience.
