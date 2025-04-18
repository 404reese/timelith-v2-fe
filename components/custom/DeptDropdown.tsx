"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DepartmentSelect from "./DepartmentSelect";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  semester: string;
  lecturesPerWeek: number;
  department: {
    id: number;
    name: string;
    acronym: string;
  };
  type: string;
  periodDuration: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState<Omit<Course, "id">>({
    courseCode: "",
    courseName: "",
    semester: "",
    lecturesPerWeek: 0,
    department: { id: 0, name: "", acronym: "" },
    type: "",
    periodDuration: 1,
  });

  // Fetch Courses
  useEffect(() => {
    fetch("http://localhost:8080/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  // Fetch Departments
  useEffect(() => {
    fetch("http://localhost:8080/departments")
      .then((res) => res.json())
      .then((data) => {
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setDepartments([]); // Ensure it's always an array
      });
  }, []);

  const handleAdd = () => {
    if (!newCourse.courseCode || !newCourse.courseName || !newCourse.department.id) return;

    fetch("http://localhost:8080/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
    })
      .then((res) => res.json())
      .then((data) => setCourses([...courses, data]))
      .catch((err) => console.error("Error adding course:", err));
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setNewCourse(course);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    fetch(`http://localhost:8080/courses/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
    })
      .then(() => {
        setCourses(courses.map((c) => (c.id === editingId ? { ...newCourse, id: editingId } : c)));
        setEditingId(null);
      })
      .catch((err) => console.error("Error updating course:", err));
  };

  const handleDelete = (id: number) => {
    fetch(`http://localhost:8080/courses/${id}`, { method: "DELETE" })
      .then(() => setCourses(courses.filter((course) => course.id !== id)))
      .catch((err) => console.error("Error deleting course:", err));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Course Records</h1>

      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input placeholder="Course Code" value={newCourse.courseCode} onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })} />
          <Input placeholder="Course Name" value={newCourse.courseName} onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })} />
          <Select value={newCourse.semester} onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(8)].map((_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Semester {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DepartmentSelect
            value={String(newCourse.department.id)}
            onValueChange={(value, department) => 
              setNewCourse({ 
                ...newCourse, 
                department: { 
                  id: Number(value), 
                  name: department.name, 
                  acronym: department.acronym 
                } 
              })
            }
          />
          <Select value={newCourse.type} onValueChange={(value) => setNewCourse({ ...newCourse, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Course Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lecture">Lecture</SelectItem>
              <SelectItem value="Lab">Lab</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(newCourse.periodDuration)} onValueChange={(value) => setNewCourse({ ...newCourse, periodDuration: Number(value) })}>
            <SelectTrigger>
              <SelectValue placeholder="Period Duration" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3].map((hours) => (
                <SelectItem key={hours} value={String(hours)}>
                  {hours} Hour{hours > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={editingId ? handleUpdate : handleAdd} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {editingId ? "Update Course" : "Add Course"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell>{course.department.name}</TableCell>
                <TableCell>{course.type}</TableCell>
                <TableCell>{course.periodDuration} hrs</TableCell>
                <TableCell>
                  <Button variant="outline" onClick={() => handleEdit(course)}>Edit</Button>
                  <Button variant="outline" onClick={() => handleDelete(course.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
