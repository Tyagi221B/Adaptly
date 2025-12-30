"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EnrolledStudent } from "@/actions/instructor.actions";

interface EnrolledStudentsTableProps {
  students: EnrolledStudent[];
  courseId: string;
  isAllStudentsView?: boolean;
}

export default function EnrolledStudentsTable({
  students,
  courseId,
  isAllStudentsView = false,
}: EnrolledStudentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-card p-12 text-center">
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No students enrolled yet
        </h3>
        <p className="text-muted-foreground">
          Students will appear here once they enroll in your course
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredStudents.length} of {students.length} student
          {students.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Quizzes</TableHead>
              <TableHead>Avg Score</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={student.profilePicture}
                          alt={student.name}
                        />
                        <AvatarFallback>
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {student.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {student.progress.completed}/{student.progress.total}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.progress.percentage}% complete
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {student.quizzes.passed}/{student.quizzes.total}
                      </p>
                      <p className="text-sm text-muted-foreground">passed</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{student.quizzes.averageScore}%</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(student.enrolledAt).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={
                          isAllStudentsView
                            ? `/instructor/students/${student._id}`
                            : `/instructor/courses/${courseId}/students/${student._id}`
                        }
                      >
                        View Details →
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">
                    No students found matching &quot;{searchQuery}&quot;
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
