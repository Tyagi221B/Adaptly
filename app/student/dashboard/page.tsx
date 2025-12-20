import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import DashboardHeader from "@/components/dashboard/dashboard-header";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Placeholder for future content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              My Courses
            </h3>
            <p className="text-sm text-gray-600">
              Browse and enroll in courses
            </p>
            <p className="mt-4 text-2xl font-bold text-gray-400">Coming Soon</p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Progress
            </h3>
            <p className="text-sm text-gray-600">Track your learning progress</p>
            <p className="mt-4 text-2xl font-bold text-gray-400">Coming Soon</p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              AI Tutor
            </h3>
            <p className="text-sm text-gray-600">
              Get personalized learning help
            </p>
            <p className="mt-4 text-2xl font-bold text-gray-400">Coming Soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}
