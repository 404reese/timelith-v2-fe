"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Users, GitBranch, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DepartmentSelect from "@/components/custom/DepartmentSelect";
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
import { useRouter } from "next/navigation";

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

interface SubBatch {
  id?: number;
  subBatchName: string;
  divisionId: number;
  studentIds: number[];
}

const SEMESTERS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII"
];

export default function DivisionsPage() {
  const router = useRouter();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newDivision, setNewDivision] = useState<Omit<Division, 'id'>>({
    year: 1,
    yearInWords: "first",
    identity: "A",
    semester: "I",
    academicYear: "",
    department: { id: 1, name: "AI-DS", acronym: "Artificial Intelligence & Data Science" },
    studentIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [divisionStudentCounts, setDivisionStudentCounts] = useState<Record<number, number>>({});
  const [subBatchDialogOpen, setSubBatchDialogOpen] = useState(false);
  const [selectedDivisionForSubBatch, setSelectedDivisionForSubBatch] = useState<Division | null>(null);
  const [newSubBatch, setNewSubBatch] = useState<SubBatch>({
    subBatchName: '',  // Changed from 'name' to 'subBatchName'
    divisionId: 0,
    studentIds: []
  });
  const [divisionSubBatches, setDivisionSubBatches] = useState<Record<number, SubBatch[]>>({});
  const [editingSubBatchId, setEditingSubBatchId] = useState<number | null>(null);

  useEffect(() => {
    fetchDivisions();
    fetchStudents();
  }, []);

  const fetchDivisions = async () => {
    try {
      const response = await fetch("http://localhost:8080/divisions");
      const data = await response.json();
      setDivisions(data);
      
      // Fetch both student counts and sub-batches for each division
      const counts: Record<number, number> = {};
      for (const division of data) {
        counts[division.id] = await fetchStudentCount(division.id);
        await fetchDivisionSubBatches(division.id); // Fetch sub-batches here
      }
      setDivisionStudentCounts(counts);
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

  const fetchStudentCount = async (divisionId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/divisions/${divisionId}/students`);
      const students = await response.json();
      return students.length;
    } catch (error) {
      console.error(`Error fetching student count for division ${divisionId}:`, error);
      return 0;
    }
  };

  const fetchDivisionSubBatches = async (divisionId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/divisions/${divisionId}/subbatches`);
      const data = await response.json();
      setDivisionSubBatches(prev => ({
        ...prev,
        [divisionId]: data
      }));
      return data;
    } catch (error) {
      console.error("Error fetching sub-batches:", error);
      return [];
    }
  };

  const resetForm = () => {
    setNewDivision({
      year: 1,
      yearInWords: "first",
      identity: "A",
      semester: "I",
      academicYear: "",
      department: { id: 1, name: "AI-DS", acronym: "Artificial Intelligence & Data Science" },
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

  const handleCreateSubBatch = async () => {
    if (!selectedDivisionForSubBatch || !newSubBatch.subBatchName) return;

    try {
      const response = await fetch(`http://localhost:8080/divisions/${selectedDivisionForSubBatch.id}/subbatches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subBatchName: newSubBatch.subBatchName  // Only send subBatchName
        }),
      });

      if (response.ok) {
        await fetchDivisionSubBatches(selectedDivisionForSubBatch.id);
        setNewSubBatch({
          subBatchName: '',  // Reset with correct property name
          divisionId: selectedDivisionForSubBatch.id,
          studentIds: []
        });
      }
    } catch (error) {
      console.error("Error creating sub-batch:", error);
    }
  };

  const handleEditSubBatch = (batch: SubBatch) => {
    setEditingSubBatchId(batch.id!);
    setNewSubBatch({
      ...batch
    });
  };

  const handleUpdateSubBatch = async () => {
    if (!editingSubBatchId || !newSubBatch.subBatchName) return;

    try {
      const response = await fetch(`http://localhost:8080/subbatches/${editingSubBatchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subBatchName: newSubBatch.subBatchName
        }),
      });

      if (response.ok) {
        await fetchDivisionSubBatches(newSubBatch.divisionId);
        setEditingSubBatchId(null);
        setNewSubBatch({
          subBatchName: '',
          divisionId: newSubBatch.divisionId,
          studentIds: []
        });
      }
    } catch (error) {
      console.error("Error updating sub-batch:", error);
    }
  };

  const handleDeleteSubBatch = async (subBatchId: number, divisionId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/subbatches/${subBatchId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        await fetchDivisionSubBatches(divisionId);
      }
    } catch (error) {
      console.error("Error deleting sub-batch:", error);
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
              
              <DepartmentSelect
                value={newDivision.department.id.toString()}
                onValueChange={(value, department) =>
                  setNewDivision({
                    ...newDivision,
                    department: department
                  })
                }
              />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {loading ? (
    <div className="col-span-full text-center">Loading...</div>
  ) : divisions.length === 0 ? (
    <div className="col-span-full text-center text-muted-foreground">
      No divisions found. Add one to get started.
    </div>
  ) : (
    divisions.map((division) => (
      <div key={division.id} className="rounded-lg border bg-card p-6 shadow-sm">
        {/* Title Row */}
        <div className="mb-4">
          <h3 className="text-xl font-bold">
            {division.department.name} - {division.identity}
          </h3>
        </div>

        {/* Department Row */}
        <div className="mb-2">
          <p className="text-sm text-muted-foreground">
            {division.department.name}
          </p>
        </div>

        {/* Semester/Year Row */}
        <div className="mb-4">
          <p className="text-sm">
            Year {division.year} • Sem {division.semester}
          </p>
          <p className="text-sm text-muted-foreground">
            {division.academicYear}
          </p>
        </div>
        <div className="mb-6 mt-4">
  <Button
    variant="secondary"
    className="w-full border hover:text-blue-600 hover:border-blue-600 hover:border"
    onClick={() => router.push(`/divisions/${division.id}/assign-students`)}
  >
    <Users className="h-4 w-4 mr-2" />
    Assign Students
    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
      divisionStudentCounts[division.id] === 0 
        ? 'bg-red-100 text-red-600' 
        : 'bg-blue-100 text-blue-600'
    }`}>
      {divisionStudentCounts[division.id] || 0} students
    </span>
  </Button>
</div>
        {/* detailed view Button */}
        <div className="mb-6 mt-4">
        <Button
  variant="secondary"
  className="w-full border hover:text-blue-600 hover:border-blue-600 hover:border"
  onClick={() => router.push(`/divisions/${division.id}/subbatches`)}
>
  <GitBranch className="h-4 w-4 mr-2" />
  Manage Sub-batches
  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
    (divisionSubBatches[division.id]?.length || 0) === 0 
      ? 'bg-red-100 text-red-600' 
      : 'bg-blue-100 text-blue-600'
  }`}>
    {divisionSubBatches[division.id]?.length || 0} batches
  </span>
</Button>
</div>
<div className="mb-6 mt-4">
  <Button
    variant="secondary"
    className="w-full border hover:text-blue-600 hover:border-blue-600 hover:border"
    onClick={() => router.push(`/divisions/${division.id}/periods`)}
  >
    <Eye className="h-4 w-4 mr-2" />
    Detailed Period View
  </Button>
</div>

        {/* Edit/Delete Actions (aligned bottom) */}
        <div className="mt-6 pt-4 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(division)}
            className="text-blue-600 hover:border-blue-600"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(division.id)}
            className="text-red-600 hover:border-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    ))
  )}
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

      {/* Sub-batch Creation Dialog */}
      <Dialog open={subBatchDialogOpen} onOpenChange={setSubBatchDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create Sub-batch</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                placeholder="Sub-batch Name"
                value={newSubBatch.subBatchName}
                onChange={(e) => setNewSubBatch({ ...newSubBatch, subBatchName: e.target.value })}
                className="col-span-4"
              />
            </div>
            {selectedDivisionForSubBatch && (
              <div className="text-sm text-muted-foreground mb-4">
                Division: {selectedDivisionForSubBatch.department.name} - {selectedDivisionForSubBatch.identity}
              </div>
            )}
            
            {/* Sub-batches List */}
            <div className="space-y-4">
              <h3 className="font-medium">Existing Sub-batches</h3>
              <div className="grid grid-cols-1 gap-4">
                {selectedDivisionForSubBatch && divisionSubBatches[selectedDivisionForSubBatch.id]?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sub-batches created yet</p>
                ) : (
                  divisionSubBatches[selectedDivisionForSubBatch?.id || 0]?.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{batch.subBatchName}</p>
                        <p className="text-sm text-muted-foreground">
                          {batch.studentIds?.length || 0} students
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubBatch(batch)}
                          className="text-blue-600 hover:border-blue-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSubBatch(batch.id!, selectedDivisionForSubBatch?.id!)}
                          className="text-red-600 hover:border-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSubBatchDialogOpen(false);
              setEditingSubBatchId(null);
              setNewSubBatch({
                subBatchName: '',
                divisionId: selectedDivisionForSubBatch?.id || 0,
                studentIds: []
              });
            }}>
              Cancel
            </Button>
            <Button onClick={editingSubBatchId ? handleUpdateSubBatch : handleCreateSubBatch}>
              {editingSubBatchId ? 'Update Sub-batch' : 'Create Sub-batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}