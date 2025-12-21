import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth-config";
import { InstructorSidebar } from "@/components/navigation/instructor-sidebar";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { AppLogo } from "@/components/navigation/logo";
import { signOut } from "next-auth/react";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "instructor") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <InstructorSidebar />
      <SidebarInset>
        {/* Top navbar */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* Desktop logo */}
            <AppLogo className="hidden md:flex" />
            {/* Mobile logo */}
            <Link href="/" className="text-xl font-bold md:hidden">
              Adaptly
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Separator orientation="vertical" className="h-6" />
            <div className="text-right">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{session.user.role}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ callbackUrl: "/" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
