// Admin Dashboard Types

export interface StudentListItem {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  enrollmentCount: number; // Calculated
  quizzesPassedCount: number; // Calculated
  averageScore: number; // Calculated
  createdAt: Date;
}

export interface StudentDetails extends StudentListItem {
  bio?: string;
  linkedIn?: string;
  github?: string;
  enrollments: StudentEnrollment[];
  quizStats: QuizStatistics;
  reviews: StudentReview[];
}

export interface StudentEnrollment {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  instructorName: string;
  enrolledAt: Date;
  completedLectures: number;
  totalLectures: number;
  progressPercentage: number;
  quizzesTaken: number;
  quizzesPassed: number;
  averageQuizScore: number;
}

export interface QuizStatistics {
  totalAttempts: number;
  totalPassed: number;
  totalFailed: number;
  passRate: number; // Percentage
  averageScore: number;
  attemptsByCourse: {
    courseId: string;
    courseTitle: string;
    attempts: number;
    passed: number;
    averageScore: number;
  }[];
  recentAttempts: {
    attemptId: string;
    lectureTitle: string;
    courseTitle: string;
    score: number;
    passed: boolean;
    attemptedAt: Date;
  }[];
}

export interface StudentReview {
  _id: string;
  courseId: string;
  courseTitle: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface InstructorListItem {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  totalCourses: number; // Calculated
  publishedCourses: number; // Calculated
  totalStudents: number; // Calculated (sum of enrollments)
  averageRating: number; // Calculated (avg across courses)
  createdAt: Date;
}

export interface InstructorDetails extends InstructorListItem {
  bio?: string;
  linkedIn?: string;
  github?: string;
  courses: InstructorCourse[];
}

export interface InstructorCourse {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  isPublished: boolean;
  enrolledStudents: number; // Calculated
  totalLectures: number;
  totalQuizzes: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
}

export interface PlatformStats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  totalQuizAttempts: number;
  averagePlatformRating: number;
  publishedCourses: number;
  totalReviews: number;
}

export interface TrendingCourse {
  _id: string;
  title: string;
  instructorName: string;
  enrollments: number;
  averageRating: number;
  totalReviews: number;
  thumbnail?: string;
  category: string;
}

export interface RecentActivity {
  _id: string;
  type: "enrollment" | "quiz_passed" | "review" | "course_published";
  userName: string;
  userRole: "student" | "instructor";
  description: string;
  timestamp: Date;
  relatedId?: string; // courseId, quizId, etc.
}
