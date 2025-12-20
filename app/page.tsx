import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-white to-gray-50 px-4">
      <div className="mx-auto max-w-3xl text-center">
        {/* Logo/Brand */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Adaptly
        </h1>

        {/* Tagline */}
        <p className="mb-8 text-xl text-gray-600">
          AI-Powered Adaptive Learning Platform
        </p>

        {/* Description */}
        <p className="mb-12 text-lg leading-relaxed text-gray-700">
          Learn smarter with AI that understands your mistakes and creates
          personalized content just for you. Like Duolingo, but for technical
          courses.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/login">Login</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              Personalized Learning
            </h3>
            <p className="text-sm text-gray-600">
              AI analyzes your mistakes and creates custom explanations tailored
              to your understanding
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              Adaptive Quizzes
            </h3>
            <p className="text-sm text-gray-600">
              Questions adjust to your level, ensuring you&apos;re always challenged
              but never overwhelmed
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              Track Progress
            </h3>
            <p className="text-sm text-gray-600">
              Visual analytics show your knowledge evolution and weak areas to
              focus on
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
