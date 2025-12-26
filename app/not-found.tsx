import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-6 text-center">
            <p className="text-6xl font-bold text-primary">404</p>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn&apos;t find what you were looking for.
            </p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Here are some helpful links instead:
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <Link
                href="/student/dashboard"
                className="text-primary hover:underline"
              >
                Student Dashboard
              </Link>
              <Link
                href="/instructor/dashboard"
                className="text-primary hover:underline"
              >
                Instructor Dashboard
              </Link>
              <Link
                href="/student/discover"
                className="text-primary hover:underline"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            asChild
            variant="default"
            className="w-full sm:w-auto"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link href="/student/discover">
              <Search className="mr-2 h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
