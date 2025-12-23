"use client";

import { useState, createContext, useContext } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseSidebar } from "./course-sidebar";

const SidebarContext = createContext<{ closeSidebar: () => void } | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { closeSidebar: () => {} };
  }
  return context;
};

interface Lecture {
  _id: string;
  title: string;
  order: number;
}

interface LectureLayoutWrapperProps {
  courseId: string;
  courseTitle: string;
  lectures: Lecture[];
  completedLectureIds: string[];
  children: React.ReactNode;
}

export function LectureLayoutWrapper({
  courseId,
  courseTitle,
  lectures,
  completedLectureIds,
  children,
}: LectureLayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-16 left-4 z-50 md:top-20 md:left-4 text-green-600 hover:text-green-700 dark:text-orange-500 dark:hover:text-orange-600 bg-background border border-border shadow-md hover:bg-accent"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {isSidebarOpen && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed top-16 left-72 z-50 md:top-20 md:left-74 text-green-600 hover:text-green-700 dark:text-orange-500 dark:hover:text-orange-600 bg-background border border-border shadow-md hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </Button>

          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        </>
      )}

      <div
        className={`
          fixed md:static top-16 bottom-0 md:inset-y-0 left-0 z-60
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${!isSidebarOpen ? "md:hidden" : ""}
        `}
      >
        <CourseSidebar
          courseId={courseId}
          courseTitle={courseTitle}
          lectures={lectures}
          completedLectureIds={completedLectureIds}
          onLinkClick={closeSidebar}
        />
      </div>

      <div className={`flex-1 overflow-auto ${isSidebarOpen ? "md:ml-0" : ""}`}>
        <SidebarContext.Provider value={{ closeSidebar }}>
          {children}
        </SidebarContext.Provider>
      </div>
    </div>
  );
}
