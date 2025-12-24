import { Suspense } from "react";
import LoginForm from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-md" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
