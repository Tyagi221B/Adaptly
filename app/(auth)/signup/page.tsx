import { Suspense } from "react";
import SignupForm from "@/components/auth/signup-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<Skeleton className="h-125 w-full max-w-md" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
