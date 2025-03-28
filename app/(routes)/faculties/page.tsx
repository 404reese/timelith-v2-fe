"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, BookOpen, Search } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

interface Department {
  id: number;
  name: string;
  acronym: string;
}

interface Instructor {
  id: number;
  title: string;
  fullName: string;
  initials: string;
  instructorEmail: string;
  departmentPreference: Department;
  teachingCourses: any[];
}

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  courseInit: string;
  semester: string;
  type: string;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newInstructor, setNewInstructor] = useState<Partial<Instructor>>({
    title: "",
    fullName: "",
    initials: "",
    instructorEmail: "",
    departmentPreference: { id: 0, name: "", acronym: "" },
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Fetch Instructors
  useEffect(() => {
    fetch(`${API_BASE_URL}/instructors`)
      .then((res) => res.json())
      .then((data) => {
        setInstructors(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching instructors:", err);
        setInstructors([]);
      });
  }, []);

  // Fetch Courses
  useEffect(() => {
    if (isAssignDialogOpen) {
      fetch(`${API_BASE_URL}/courses`)
        .then((res) => res.json())
        .then((data) => {
          setCourses(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Error fetching courses:", err));
    }
  }, [isAssignDialogOpen]);

  const handleAdd = () => {
    if (!newInstructor.title || !newInstructor.fullName || 
        !newInstructor.initials || !newInstructor.instructorEmail || 
        !newInstructor.departmentPreference?.id) {
      alert('Please fill in all fields');
      return;
    }

    fetch(`${API_BASE_URL}/instructors/${newInstructor.departmentPreference.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newInstructor.title,
        fullName: newInstructor.fullName,
        initials: newInstructor.initials,
        instructorEmail: newInstructor.instructorEmail,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setInstructors([...instructors, data]);
        resetForm();
      })
      .catch((err) => {
        console.error('Error adding instructor:', err);
        alert('Failed to add instructor');
      });
  };

  const handleUpdate = () => {
    if (!editingId || !newInstructor.departmentPreference?.id) {
      alert('Invalid instructor or department');
      return;
    }

    fetch(`${API_BASE_URL}/instructors/${editingId}?departmentId=${newInstructor.departmentPreference.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newInstructor.title,
        fullName: newInstructor.fullName,
        initials: newInstructor.initials,
        instructorEmail: newInstructor.instructorEmail,
      }),
    })
      .then(() => {
        // Update the local state
        setInstructors(instructors.map((instructor) =>
          instructor.id === editingId 
            ? { ...newInstructor, id: editingId } as Instructor 
            : instructor
        ));
        setEditingId(null);
        resetForm();
      })
      .catch((err) => {
        console.error('Error updating instructor:', err);
        alert('Failed to update instructor');
      });
  };

  const handleDelete = (id: number) => {
    fetch(`${API_BASE_URL}/instructors/${id}`, { 
      method: "DELETE" 
    })
      .then(() => {
        setInstructors(instructors.filter((instructor) => instructor.id !== id));
      })
      .catch((err) => {
        console.error('Error deleting instructor:', err);
        alert('Failed to delete instructor');
      });
  };

  const handleEdit = (instructor: Instructor) => {
    if (editingId === instructor.id) {
      // If clicking the same edit button, cancel editing
      setEditingId(null);
      resetForm();
    } else {
      // Start editing the selected instructor
      setEditingId(instructor.id);
      setNewInstructor(instructor);
    }
  };

  const handleAssignDialogOpen = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setSelectedCourses(instructor.teachingCourses.map((c: any) => c.id));
    setIsAssignDialogOpen(true);
  };

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses(current =>
      current.includes(courseId)
        ? current.filter(id => id !== courseId)
        : [...current, courseId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedInstructor) return;

    try {
      // Get existing course IDs
      const existingCourseIds = selectedInstructor.teachingCourses.map((c: any) => c.id);
      
      // Determine courses to add and remove
      const coursesToAdd = selectedCourses.filter(id => !existingCourseIds.includes(id));
      const coursesToRemove = existingCourseIds.filter(id => !selectedCourses.includes(id));

      // Make API calls if there are changes
      if (coursesToAdd.length > 0) {
        await fetch(`${API_BASE_URL}/instructors/${selectedInstructor.id}/teaching-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursesToAdd)
        });
      }

      if (coursesToRemove.length > 0) {
        await fetch(`${API_BASE_URL}/instructors/${selectedInstructor.id}/teaching-courses`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursesToRemove)
        });
      }

      // Refresh instructor data
      const response = await fetch(`${API_BASE_URL}/instructors/${selectedInstructor.id}`);
      const updatedInstructor = await response.json();
      
      setInstructors(instructors.map(i =>
        i.id === selectedInstructor.id ? updatedInstructor : i
      ));
      
      setIsAssignDialogOpen(false);
      setSearchQuery('');
    } catch (err) {
      console.error("Error updating course assignments:", err);
      alert('Failed to update course assignments');
    }
  };

  const resetForm = () => {
    setNewInstructor({
      title: "",
      fullName: "",
      initials: "",
      instructorEmail: "",
      departmentPreference: { id: 0, name: "", acronym: "" },
    });
  };

  const filteredCourses = courses.filter(course => 
    course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Instructor Records</h1>
      </div>
      
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            value={newInstructor.title || ""}
            onValueChange={(value) =>
              setNewInstructor({ ...newInstructor, title: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Title" />
            </SelectTrigger>
            <SelectContent>
              {["Dr.", "Prof.", "Assoc. Prof.", "Asst. Prof."].map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Full Name"
            value={newInstructor.fullName || ""}
            onChange={(e) =>
              setNewInstructor({ ...newInstructor, fullName: e.target.value })
            }
          />

          <Input
            placeholder="Initials"
            value={newInstructor.initials || ""}
            onChange={(e) =>
              setNewInstructor({ ...newInstructor, initials: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Email"
            value={newInstructor.instructorEmail || ""}
            onChange={(e) =>
              setNewInstructor({ ...newInstructor, instructorEmail: e.target.value })
            }
          />

          <Select
            value={String(newInstructor.departmentPreference?.id || "")}
            onValueChange={(value) => {
              const selectedDept = departments.find(d => d.id === Number(value));
              setNewInstructor({
                ...newInstructor,
                departmentPreference: selectedDept || { id: Number(value), name: "", acronym: "" }
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
        </div>

        <Button 
          onClick={editingId ? handleUpdate : handleAdd} 
          className="w-full mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          {editingId ? "Update Instructor" : "Add Instructor"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Initials</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Courses</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instructors.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell>{instructor.title}</TableCell>
                <TableCell>{instructor.fullName}</TableCell>
                <TableCell>{instructor.initials}</TableCell>
                <TableCell>{instructor.instructorEmail}</TableCell>
                <TableCell>
                  {instructor.departmentPreference?.name || instructor.departmentPreference?.acronym || 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {instructor.teachingCourses.length > 0 ? (
                      instructor.teachingCourses.map((course: any) => (
                        <Badge key={course.id} variant="secondary">
                          {course.courseCode}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No courses assigned
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAssignDialogOpen(instructor)}
                      className="transition-colors hover:text-blue-600 hover:border-blue-600"
                    >
                      Assign Courses
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(instructor)}
                      className="transition-colors hover:text-blue-600 hover:border-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(instructor.id)}
                      className="transition-colors hover:text-red-600 hover:border-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {instructors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No instructors found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Assign Courses to {selectedInstructor?.fullName}</DialogTitle>
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-[50vh] max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <div key={course.id} 
                  className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={() => handleCourseToggle(course.id)}
                  />
                  <div className="flex flex-col">
                    <label className="font-medium">
                      {course.courseCode}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {course.courseName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignments}>
              Save Assignments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}