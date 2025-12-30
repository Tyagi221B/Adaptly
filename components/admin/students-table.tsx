"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentListItem } from "@/types/admin";
import { formatDistanceToNow } from "date-fns";

interface StudentsTableProps {
  students: StudentListItem[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No students found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Enrollments</TableHead>
            <TableHead className="text-center">Quizzes Passed</TableHead>
            <TableHead className="text-center">Avg Score</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={student.profilePicture} />
                    <AvatarFallback>
                      {student.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student.name}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{student.enrollmentCount}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{student.quizzesPassedCount}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={student.averageScore >= 70 ? "default" : "secondary"}
                >
                  {student.averageScore}%
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(student.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/students/${student._id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View Details
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
