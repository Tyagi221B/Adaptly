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
import type { InstructorListItem } from "@/types/admin";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";

interface InstructorsTableProps {
  instructors: InstructorListItem[];
}

export function InstructorsTable({ instructors }: InstructorsTableProps) {
  if (instructors.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No instructors found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Instructor</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center">Total Courses</TableHead>
            <TableHead className="text-center">Published</TableHead>
            <TableHead className="text-center">Total Students</TableHead>
            <TableHead className="text-center">Avg Rating</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructors.map((instructor) => (
            <TableRow key={instructor._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={instructor.profilePicture} />
                    <AvatarFallback>
                      {instructor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{instructor.name}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{instructor.email}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{instructor.totalCourses}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="default">{instructor.publishedCourses}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">{instructor.totalStudents}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {instructor.averageRating.toFixed(1)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(instructor.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                <Link
                  href={`/admin/instructors/${instructor._id}`}
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
