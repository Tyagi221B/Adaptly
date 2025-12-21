"use client";

import { LayoutDashboard, Plus } from "lucide-react";
import { AppSidebar } from "./app-sidebar";

const instructorNavItems = [
  {
    title: "Dashboard",
    href: "/instructor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create Course",
    href: "/instructor/courses/new",
    icon: Plus,
  },
];

export function InstructorSidebar() {
  return <AppSidebar navItems={instructorNavItems} />;
}
