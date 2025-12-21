"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-xl font-bold tracking-tight",
        className
      )}
    >
      <span>Adaptly</span>
    </Link>
  );
}
