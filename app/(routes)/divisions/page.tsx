"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Division {
  id: number;
  year: number;
  yearInWords: string;
  identity: string;
  semester: string;
  academicYear: string;
  department: {
    id: number;
    name: string;
    acronym: string;
  };
  studentIds: number[];
}

interface Student {
  id: number;
  name: string;
  rollNumber: string;
}

const DEPARTMENTS = [
  { id: 1, name: "AI-DS", acronym: "Artificial Intelligence & Data Science" },
  { id: 2, name: "Electrical Engineering", acronym: "EE" },
  { id: 3, name: "Mechanical Engineering", acronym: "ME" },
  { id: 4, name: "Civil Engineering", acronym: "CE" },
  { id: 5, name: "Chemical Engineering", acronym: "ChE" },
];

const SEMESTERS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII"
];

export default function DivisionsPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newDivision, setNewDivision] = useState<Omit<Division, 'id'>>({
    year: 1,
    yearInWords: "first",
    identity: "A",
    semester: "I",
    academicYear: "",
    department: DEPARTMENTS[0],
    studentIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  useEffect(() => {
    fetchDivisions();
    fetchStudents();
  }, []);

  const fetchDivisions = async () => {
    try {
      const response = await fetch("http://localhost:8080/divisions");
      const data = await response.json();
      setDivisions(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:8080/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchDivisionDetails = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/divisions/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching division details:", error);
      return null;
    }
  };

  const resetForm = () => {
    setNewDivision({
      year: 1,
      yearInWords: "first",
      identity: "A",
      semester: "I",
      academicYear: "",
      department: DEPARTMENTS[0],
      studentIds: [],
    });
  };

  const handleAdd = async () => {
    if (!newDivision.academicYear) return;

    try {
      const response = await fetch(`http://localhost:8080/divisions/${newDivision.department.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDivision),
      });
      
      if (response.ok) {
        fetchDivisions();
        resetForm();
      }
    } catch (error) {
      console.error("Error adding division:", error);
    }
  };

  const handleEdit = (division: Division) => {
    if (editingId === division.id) {
      setEditingId(null);
      resetForm();
    } else {
      setEditingId(division.id);
      setNewDivision({
        year: division.year,
        yearInWords: division.yearInWords,
        identity: division.identity,
        semester: division.semester,
        academicYear: division.academicYear,
        department: division.department,
        studentIds: division.studentIds || [],
      });
    }
  };

  const handleUpdate = async (id: number) => {
    if (!newDivision.academicYear) return;

    try {
      const response = await fetch(`http://localhost:8080/divisions/${id}?departmentId=${newDivision.department.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDivision),
      });
      
      if (response.ok) {
        fetchDivisions();
        setEditingId(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error updating division:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/divisions/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchDivisions();
      }
    } catch (error) {
      console.error("Error deleting division:", error);
    }
  };

  const openStudentDialog = async (division: Division) => {
    const divisionDetails = await fetchDivisionDetails(division.id);
    setSelectedDivision(divisionDetails);
    setSelectedStudents(divisionDetails.studentIds || []);
    setStudentDialogOpen(true);
  };

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  const saveStudentAssignments = async () => {
    if (!selectedDivision) return;

    try {
      // First get current students to determine which to add/remove
      const currentStudents = selectedDivision.studentIds || [];
      
      // Students to add (newly selected but not in current)
      const studentsToAdd = selectedStudents.filter(id => !currentStudents.includes(id));
      
      // Students to remove (in current but not in selected)
      const studentsToRemove = currentStudents.filter(id => !selectedStudents.includes(id));

      // Add new students
      if (studentsToAdd.length > 0) {
        await fetch(`http://localhost:8080/divisions/${selectedDivision.id}/students`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentsToAdd),
        });
      }

      // Remove unselected students
      if (studentsToRemove.length > 0) {
        for (const studentId of studentsToRemove) {
          await fetch(`http://localhost:8080/divisions/${selectedDivision.id}/students?studentId=${studentId}`, {
            method: "DELETE",
          });
        }
      }

      // Refresh data
      fetchDivisions();
      setStudentDialogOpen(false);
    } catch (error) {
      console.error("Error updating student assignments:", error);
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.rollNumber} - ${student.name}` : `Student ID: ${studentId}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Division Records</h1>
      </div>
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="space-y-4">
          <div className="flex gap-4 items-center justify-between">
            <div className="flex-1 flex items-center gap-4 min-w-0">
              <Select
                value={newDivision.year.toString()}
                onValueChange={(value) =>
                  setNewDivision({ ...newDivision, year: parseInt(value) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={newDivision.identity}
                onValueChange={(value) =>
                  setNewDivision({ ...newDivision, identity: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Div" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D", "E", "F", "G", "H"].map(div => (
                    <SelectItem key={div} value={div}>
                      {div}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={newDivision.semester}
                onValueChange={(value) =>
                  setNewDivision({ ...newDivision, semester: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map(sem => (
                    <SelectItem key={sem} value={sem}>
                      Sem {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Academic Year"
                value={newDivision.academicYear}
                onChange={(e) =>
                  setNewDivision({ ...newDivision, academicYear: e.target.value })
                }
                className="w-full"
              />
              
              <Select
                value={newDivision.department.id.toString()}
                onValueChange={(value) =>
                  setNewDivision({
                    ...newDivision,
                    department: DEPARTMENTS.find(d => d.id === parseInt(value)) || DEPARTMENTS[0]
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={editingId ? () => handleUpdate(editingId) : handleAdd}
                className="transition-all hover:scale-105 hover:bg-primary/90"
              >
                {editingId ? (
                  <Pencil className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {editingId ? "Update Division" : "Add Division"}
              </Button>
              
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Division</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Students</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : divisions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No divisions found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              divisions.map((division) => (
                <TableRow key={division.id}>
                  <TableCell>{division.identity}</TableCell>
                  <TableCell>Year {division.year}</TableCell>
                  <TableCell>Sem {division.semester}</TableCell>
                  <TableCell>{division.academicYear}</TableCell>
                  <TableCell>
                    {division.department?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {division.studentIds && division.studentIds.length > 0 ? (
                        <Badge variant="secondary">
                          {division.studentIds.length} students
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          No students enrolled
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStudentDialog(division)}
                        className="transition-colors hover:text-green-600 hover:border-green-600"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(division)}
                        className="transition-colors hover:text-blue-600 hover:border-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(division.id)}
                        className="transition-colors hover:text-red-600 hover:border-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Student Enrollment Dialog */}
      <Dialog open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Students for Division {selectedDivision?.identity} (Year {selectedDivision?.year})
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <h3 className="font-medium">Available Students</h3>
            <div className="space-y-2">
              {students.map(student => (
                <div key={student.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`student-${student.id}`}
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => 
                      handleStudentSelection(student.id, checked as boolean)
                    }
                  />
                  <label htmlFor={`student-${student.id}`} className="text-sm">
                    {student.rollNumber} - {student.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setStudentDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={saveStudentAssignments}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}