"use client";

import { LayoutDashboard, Library } from "lucide-react";
import { AppSidebar } from "./app-sidebar";

const studentNavItems = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Browse Courses",
    href: "/student/discover",
    icon: Library,
  },
];

export function StudentSidebar() {
  return <AppSidebar navItems={studentNavItems} />;
}
