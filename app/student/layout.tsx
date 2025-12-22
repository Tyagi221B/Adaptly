import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { TopNav } from "@/components/navigation/top-nav";
import { Footer } from "@/components/navigation/footer";

export default async function StudentLayout({
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
      <TopNav userName={session.user.name} userRole="student" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
