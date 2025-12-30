"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "student";
  const platformUrl = `/${userRole}/dashboard`;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <Link href={platformUrl}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Platform
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          Admin
        </Badge>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
          <Avatar>
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
