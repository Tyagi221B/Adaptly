import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutLoadingSkeleton />}>
      <AuthenticatedAdminLayout>{children}</AuthenticatedAdminLayout>
    </Suspense>
  );
}

async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session) {
    redirect("/login");
  }

  // Check if user is admin
  if (!session.user.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminLayoutLoadingSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r bg-white p-4 space-y-4">
        <Skeleton className="h-8 w-32 mb-6" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header skeleton */}
        <header className="border-b bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        {/* Content skeleton */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </main>
      </div>
    </div>
  );
}
