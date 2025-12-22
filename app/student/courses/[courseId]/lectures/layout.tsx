import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { authOptions } from "@/lib/auth-config";
import { getCourseForStudent } from "@/actions/course.actions";
import { getCourseLectures } from "@/actions/lecture.actions";
import { getEnrollmentByCourseId } from "@/actions/enrollment.actions";
import { CourseSidebar } from "@/components/student/course-sidebar";

export default async function LectureLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;

  // Fetch course details
  const courseResult = await getCourseForStudent(courseId);
  if (!courseResult.success || !courseResult.data) {
    redirect("/student/courses");
  }

  // Fetch all lectures for the course
  const lecturesResult = await getCourseLectures(courseId, session.user.id);
  const lectures = lecturesResult.success && lecturesResult.data
    ? lecturesResult.data
    : [];

  // Get enrollment to check completed lectures
  const enrollmentResult = await getEnrollmentByCourseId(
    session.user.id,
    courseId
  );
  const completedLectureIds = enrollmentResult.success && enrollmentResult.data
    ? enrollmentResult.data.completedLectures.map((id: Types.ObjectId) => id.toString())
    : [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <CourseSidebar
        courseId={courseId}
        courseTitle={courseResult.data.course.title}
        lectures={lectures}
        completedLectureIds={completedLectureIds}
      />

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
