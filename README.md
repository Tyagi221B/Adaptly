# Adaptly

An AI-powered Learning Management System built with Next.js 16, TypeScript, and MongoDB.

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

Create courses with lectures (markdown-based content with syntax highlighting). The interesting part is the AI quiz generation - you can generate multiple-choice quizzes directly from lecture content. It works surprisingly well and saves a lot of time.

### For Students

The learning flow is:
1. Enroll in courses from the discover page
2. Read lectures with the AI chat sidebar available (desktop) or floating button (mobile)
3. Take quizzes on a separate page (no AI access here - academic integrity)
4. View results with AI-generated feedback on mistakes
5. Continue chatting with AI on the results page to understand concepts better

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

## Real-World Considerations

**Security:**
- Input validation with Zod on all forms and API routes
- Rate limiting on AI endpoints (prevents cost overruns)
- NextAuth for session-based auth with HTTP-only cookies
- Role-based access control (instructors can't access student quiz attempts)

**Performance:**
- Server Components where possible (smaller client bundles)
- MongoDB indexes on frequently queried fields
- Cloudinary for optimized image delivery
- LocalStorage for chat (avoids unnecessary API calls)

**Error Handling:**
- Try-catch in all Server Actions
- Toast notifications for user-facing errors
- Graceful degradation (if AI fails, quiz generation falls back to manual)

## What Could Be Improved

If I had more time:
- Add comprehensive tests (Vitest for units, Playwright for E2E)
- Implement proper caching strategy (Redis or similar)
- Add analytics dashboard for instructors
- Support for video lectures
- Better mobile experience for quiz taking
- Pagination for large course lists
- Search and filtering on discover page

## Testing Branch

There's a separate branch with test setup (mentioned in assignment) - will continue that work.

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
