"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  user: {
    name: string;
    email: string;
    role: "student" | "instructor";
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        {/* Logo/Brand */}
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Adaptly
        </Link>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>

          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
