import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { TopNav } from "@/components/navigation/top-nav";
import { Footer } from "@/components/navigation/footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutLoadingSkeleton />}>
      <AuthenticatedStudentLayout>{children}</AuthenticatedStudentLayout>
    </Suspense>
  );
}

async function AuthenticatedStudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "student") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav
        userName={session.user.name}
        userRole="student"
        isAdmin={session.user.isAdmin}
      />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function LayoutLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav skeleton */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </header>
      {/* Main content skeleton */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </main>
      {/* Footer skeleton - static, no dynamic data */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </footer>
    </div>
  );
}
