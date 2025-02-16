"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import MultipleSelector, { Option } from '@/components/ui/MultiSelector';

interface Course {
  code: string;
  name: string;
  department: string;
}

interface Faculty {
  id: string;
  facultyId: string;
  name: string;
  courses: Course[];
  department: string;
}

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
];

const OPTIONS: Option[] = [
  { label: 'Maths', value: 'Maths' },
  { label: 'DSA', value: 'DSA' },
  { label: 'DSDS', value: 'DSDS' },
  { label: 'DAA', value: 'DAA' },
  { label: 'Operating Systems', value: 'os' },
  { label: 'Artificial Intelligence', value: 'ai' },
  { label: 'Machine Learning', value: 'ml' },
  { label: 'Computer Vision', value: 'cv' },
  { label: 'Natural Language Processing', value: 'nlp' },
  { label: 'Computer Graphics', value: 'cg' },
  { label: 'Algorithms', value: 'algorithms' },
  { label: 'Data Mining', value: 'dm' },
  { label: 'Web Development', value: 'webdev' },
  { label: 'Database Management', value: 'dbms' },
  { label: 'Network Security', value: 'ns' },
  { label: 'Cloud Computing', value: 'cloud' },
  { label: 'Cybersecurity', value: 'cybersecurity' },
  { label: 'Internet of Things', value: 'iot' },
  { label: 'Robotics', value: 'robotics' },
  { label: 'Data Science', value: 'ds' },
  { label: 'Statistics', value: 'stats' },
  { label: 'Numerical Analysis', value: 'na' },
];

const COURSES: Course[] = [
  { code: "CS101", name: "Introduction to Programming", department: "Computer Science" },
  { code: "CS201", name: "Data Structures", department: "Computer Science" },
  { code: "CS301", name: "Database Management", department: "Computer Science" },
  { code: "CS401", name: "Computer Networks", department: "Computer Science" },
  { code: "EE101", name: "Circuit Theory", department: "Electrical Engineering" },
  { code: "EE201", name: "Digital Electronics", department: "Electrical Engineering" },
  { code: "ME101", name: "Engineering Mechanics", department: "Mechanical Engineering" },
  { code: "ME201", name: "Thermodynamics", department: "Mechanical Engineering" },
];

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFaculty, setNewFaculty] = useState<Faculty>({
    id: "",
    facultyId: "",
    name: "",
    courses: [],
    department: "",
  });
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourses = COURSES.filter((course) => {
    const search = searchQuery.toLowerCase();
    return (
      course.code.toLowerCase().includes(search) ||
      course.name.toLowerCase().includes(search) ||
      course.department.toLowerCase().includes(search)
    );
  });

  const resetForm = () => {
    setNewFaculty({
      id: "",
      facultyId: "",
      name: "",
      courses: [],
      department: "",
    });
    setSearchQuery("");
  };

  const handleAdd = () => {
    if (!newFaculty.facultyId || !newFaculty.name || !newFaculty.department) return;

    const faculty = {
      ...newFaculty,
      id: crypto.randomUUID(),
    };

    setFaculties([...faculties, faculty]);
    resetForm();
  };

  const handleEdit = (faculty: Faculty) => {
    if (editingId === faculty.id) {
      setEditingId(null);
      resetForm();
    } else {
      setEditingId(faculty.id);
      setNewFaculty(faculty);
    }
  };

  const handleUpdate = (id: string) => {
    if (!newFaculty.facultyId || !newFaculty.name || !newFaculty.department) return;

    setFaculties(faculties.map((faculty) =>
      faculty.id === id ? { ...newFaculty } : faculty
    ));
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setFaculties(faculties.filter((faculty) => faculty.id !== id));
  };

  // Updated: Handle selected courses from the MultipleSelector
  const handleSelectCourses = (selectedOptions: Option[]) => {
    // Extract the selected course names
    const selectedCourseNames = selectedOptions.map(option => option.label);

    // Filter COURSES to match the selected course names
    const selectedCourses = COURSES.filter(course =>
      selectedCourseNames.includes(course.name)
    );

    // Update the faculty's courses
    setNewFaculty(prev => ({
      ...prev,
      courses: selectedCourses,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Faculty Records</h1>
      </div>
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <Input
              placeholder="Faculty ID"
              value={newFaculty.facultyId}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, facultyId: e.target.value })
              }
              className="max-w-[150px]"
            />
            <Input
              placeholder="Faculty Name"
              value={newFaculty.name}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, name: e.target.value })
              }
              className="max-w-xs"
            />
            <Select
              value={newFaculty.department}
              onValueChange={(value) =>
                setNewFaculty({ ...newFaculty, department: value })
              }
            >
              <SelectTrigger className="max-w-[200px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <MultipleSelector
              defaultOptions={OPTIONS}
              placeholder="Select courses taught by faculty"
              onChange={handleSelectCourses} // Update this handler
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                  no results found.
                </p>
              }
            />
            <Button
              onClick={handleAdd}
              className="transition-all hover:scale-105 hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Courses Taught</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculties.map((faculty) => (
              <TableRow key={faculty.id}>
                <TableCell>{faculty.facultyId}</TableCell>
                <TableCell>{faculty.name}</TableCell>
                <TableCell>{faculty.department}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {faculty.courses.map((course) => (
                      <Badge key={course.code} variant="secondary">
                        {course.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(faculty)}
                      className="transition-colors hover:text-blue-600 hover:border-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(faculty.id)}
                      className="transition-colors hover:text-red-600 hover:border-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {faculties.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No faculties found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
