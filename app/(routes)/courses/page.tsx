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
import { UploadCSVButton } from "./UploadCSVButton";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  courseInit: string;
  semester: string;
  department: {
    id: number;
    name: string;
    acronym: string;
  };
  type: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [periodTypes, setPeriodTypes] = useState<{ id: number; type: string; duration: string; numberOfLecturesPerWeek: number }[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCourse, setNewCourse] = useState<Omit<Course, "id">>({
    courseCode: "",
    courseName: "",
    courseInit: "",
    semester: "",
    department: { id: 0, name: "", acronym: "" },
    type: "",
  });

  // Fetch Courses
  useEffect(() => {
    fetch(`${API_BASE_URL}/courses`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching courses:", err));
  }, []);

  // Fetch Departments
  useEffect(() => {
    fetch(`${API_BASE_URL}/departments`)
      .then((res) => res.json())
      .then((data) => {
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      });
  }, []);

  // Fetch Period Types
  useEffect(() => {
    fetch(`${API_BASE_URL}/periodicities`)
      .then((res) => res.json())
      .then((data) => {
        setPeriodTypes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching period types:", err);
        setPeriodTypes([]);
      });
  }, []);

  const handleAdd = () => {
    if (!newCourse.courseCode || !newCourse.courseName || !newCourse.department.id) return;

    fetch(`${API_BASE_URL}/courses/${newCourse.department.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseCode: newCourse.courseCode,
        courseName: newCourse.courseName,
        courseInit: newCourse.courseInit,
        semester: newCourse.semester,
        type: newCourse.type,
      }),
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

    fetch(`${API_BASE_URL}/courses/${editingId}?departmentId=${newCourse.department.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseCode: newCourse.courseCode,
        courseName: newCourse.courseName,
        courseInit: newCourse.courseInit,
        semester: newCourse.semester,
        type: newCourse.type,
      }),
    })
      .then(() => {
        setCourses(courses.map((c) =>
          c.id === editingId ? { ...newCourse, id: editingId } : c
        ));
        setEditingId(null);
      })
      .catch((err) => console.error("Error updating course:", err));
  };

  const handleDelete = (id: number) => {
    fetch(`${API_BASE_URL}/courses/${id}`, { method: "DELETE" })
      .then(() => setCourses(courses.filter((course) => course.id !== id)))
      .catch((err) => console.error("Error deleting course:", err));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Course Records</h1>
      <UploadCSVButton 
        departments={departments}
        periodTypes={periodTypes}
        onSuccess={() => {
          // Refresh course list after upload
          fetch(`${API_BASE_URL}/courses`)
            .then((res) => res.json())
            .then((data) => setCourses(Array.isArray(data) ? data : []));
        }}
      />
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Course Code"
            value={newCourse.courseCode}
            onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
          />
          <Input
            placeholder="Course Name"
            value={newCourse.courseName}
            onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
          />
          <Input
            placeholder="Course Initials"
            value={newCourse.courseInit}
            onChange={(e) => setNewCourse({ ...newCourse, courseInit: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={newCourse.semester}
            onValueChange={(value) => setNewCourse({ ...newCourse, semester: value })}
          >
            <SelectTrigger className="w-full">
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
          <Select
  value={newCourse.department.id === 0 ? "" : String(newCourse.department.id)}
  onValueChange={(value) => {
    const deptId = Number(value);
    const selectedDept = departments.find(d => d.id === deptId);
    setNewCourse({
      ...newCourse,
      department: selectedDept || { id: 0, name: "", acronym: "" },
    });
  }}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select Department" />
  </SelectTrigger>
  <SelectContent>
    {departments.map((dept) => (
      <SelectItem key={dept.id} value={String(dept.id)}>
        {dept.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
          <Select
            value={String(newCourse.type)}
            onValueChange={(value) => {
              const selectedType = periodTypes.find((pt) => pt.id === Number(value));
              if (selectedType) {
                setNewCourse({ ...newCourse, type: selectedType.type });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Course Type" />
            </SelectTrigger>
            <SelectContent>
              {periodTypes.map((pt) => (
                <SelectItem key={pt.id} value={String(pt.id)}>
                  {pt.type}
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
              <TableHead>Initials</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>{course.courseInit}</TableCell>
                <TableCell>{course.semester}</TableCell>
                <TableCell>{course.department.name}</TableCell>
                <TableCell>{course.type}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(course)}
                      className="transition-colors hover:text-blue-600 hover:border-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(course.id)}
                      className="transition-colors hover:text-red-600 hover:border-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}