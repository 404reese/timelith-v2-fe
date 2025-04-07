"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ChevronLeft, Users, BookOpen } from "lucide-react";
import { StudentManagementDialog } from './StudentManagementDialog';
import { CourseManagementDialog } from './CourseManagementDialog';

// Interfaces
interface Division {
  id: number;
  department: {
    name: string;
    acronym: string;
  };
  identity: string;
}

interface SubBatch {
  id?: number;
  subBatchName: string;
  divisionId: number;
  studentIds: number[];
}

interface Student {
  id: number;
  name: string;
  // Add other fields based on your API response
}

export default function SubBatchManagementClient({
  initialDivision,
  initialSubBatches,
}: {
  initialDivision: Division;
  initialSubBatches: SubBatch[];
}) {
  const router = useRouter();
  const [division] = useState(initialDivision);
  const [subBatches, setSubBatches] = useState(initialSubBatches);
  const [newSubBatch, setNewSubBatch] = useState<SubBatch>({
    subBatchName: "",
    divisionId: initialDivision.id,
    studentIds: [],
  });
  const [editingSubBatchId, setEditingSubBatchId] = useState<number | null>(null);

  // State for managing students
  const [selectedSubBatchId, setSelectedSubBatchId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState<boolean>(false);
  const [studentCounts, setStudentCounts] = useState<Record<number, number>>({});

  // State for managing courses
  const [selectedSubBatchForCourses, setSelectedSubBatchForCourses] = useState<number | null>(null);

  // Fetch sub-batches (existing logic)
  const fetchSubBatches = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/divisions/${initialDivision.id}/subbatches`
      );
      const data = await response.json();
      setSubBatches(data);
    } catch (error) {
      console.error("Error fetching sub-batches:", error);
    }
  };

  // Handle creating a new sub-batch
  const handleCreateSubBatch = async () => {
    if (!newSubBatch.subBatchName) return;

    try {
      const response = await fetch(
        `http://localhost:8080/divisions/${initialDivision.id}/subbatches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subBatchName: newSubBatch.subBatchName,
          }),
        }
      );

      if (response.ok) {
        await fetchSubBatches();
        setNewSubBatch({
          subBatchName: "",
          divisionId: initialDivision.id,
          studentIds: [],
        });
      }
    } catch (error) {
      console.error("Error creating sub-batch:", error);
    }
  };

  // Handle updating an existing sub-batch
  const handleUpdateSubBatch = async () => {
    if (!editingSubBatchId || !newSubBatch.subBatchName) return;

    try {
      const response = await fetch(
        `http://localhost:8080/subbatches/${editingSubBatchId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subBatchName: newSubBatch.subBatchName,
          }),
        }
      );

      if (response.ok) {
        await fetchSubBatches();
        setEditingSubBatchId(null);
        setNewSubBatch({
          subBatchName: "",
          divisionId: initialDivision.id,
          studentIds: [],
        });
      }
    } catch (error) {
      console.error("Error updating sub-batch:", error);
    }
  };

  // Handle deleting a sub-batch
  const handleDeleteSubBatch = async (subBatchId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/subbatches/${subBatchId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchSubBatches();
      }
    } catch (error) {
      console.error("Error deleting sub-batch:", error);
    }
  };

  // Handle managing students for a sub-batch
  const handleManageStudents = async (subBatchId: number) => {
    setSelectedSubBatchId(subBatchId);
    if (students.length === 0) {
      setIsLoadingStudents(true);
      try {
        const response = await fetch(
          `http://localhost:8080/divisions/${initialDivision.id}/students`
        );
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoadingStudents(false);
      }
    }
  };

  const handleSaveStudents = async (subBatchId: number, studentIds: number[]) => {
    try {
      const response = await fetch(
        `http://localhost:8080/subbatches/${subBatchId}/students`,
        {
          method: "POST",  // Changed from PUT to POST
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentIds),  // Directly send the array of IDs
        }
      );

      if (response.ok) {
        await fetchSubBatches();
      } else {
        throw new Error('Failed to save student assignments');
      }
    } catch (error) {
      console.error("Error updating students:", error);
    }
  };

  const handleSaveCourses = async (subBatchId: number, courseIds: number[]) => {
    try {
      const response = await fetch(
        `http://localhost:8080/subbatches/${subBatchId}/courses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(courseIds),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save course assignments');
      }
    } catch (error) {
      console.error("Error updating courses:", error);
    }
  };

  const fetchStudentCount = async (subBatchId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/subbatches/${subBatchId}/students`
      );
      const students = await response.json();
      setStudentCounts(prev => ({
        ...prev,
        [subBatchId]: Array.isArray(students) ? students.length : 0
      }));
    } catch (error) {
      console.error(`Error fetching student count for subbatch ${subBatchId}:`, error);
    }
  };

  useEffect(() => {
    subBatches.forEach(batch => {
      if (batch.id) {
        fetchStudentCount(batch.id);
      }
    });
  }, [subBatches]);

  return (
    <div className="container mx-auto p-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Divisions
      </Button>

      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-6">
        Manage Sub-batches - {division.department.name} {division.identity}
      </h1>

      {/* Form for Creating/Updating Sub-Batches */}
      <div className="grid gap-4 mb-8">
        <Input
          placeholder="New Sub-batch Name"
          value={newSubBatch.subBatchName}
          onChange={(e) =>
            setNewSubBatch({ ...newSubBatch, subBatchName: e.target.value })
          }
          className="max-w-md"
        />
        <Button
          onClick={editingSubBatchId ? handleUpdateSubBatch : handleCreateSubBatch}
          className="max-w-md"
        >
          {editingSubBatchId ? "Update Sub-batch" : "Create Sub-batch"}
        </Button>
      </div>

      {/* List of Sub-Batches */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Existing Sub-batches</h2>
        {subBatches.length === 0 ? (
          <p className="text-muted-foreground">No sub-batches created yet</p>
        ) : (
          subBatches.map((batch) => (
            <div key={batch.id} className="border rounded-lg p-4 space-y-4">
              {/* Sub-Batch Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{batch.subBatchName}</p>
                  <p className="text-sm text-muted-foreground">
                    {studentCounts[batch.id!] ?? 'Loading...'} students
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSubBatchId(batch.id!);
                      setNewSubBatch(batch);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSubBatch(batch.id!)}
                    className="text-red-600 hover:border-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleManageStudents(batch.id!)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedSubBatchForCourses(batch.id!)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assign Courses
                  </Button>
                </div>
              </div>

              {/* Dialogs */}
              {selectedSubBatchId && (
                <StudentManagementDialog
                  open={selectedSubBatchId !== null}
                  onOpenChange={(open) => !open && setSelectedSubBatchId(null)}
                  subBatchId={selectedSubBatchId}
                  divisionId={division.id}
                  subBatchName={subBatches.find(b => b.id === selectedSubBatchId)?.subBatchName || ''}
                  onSave={async (studentIds) => {
                    await handleSaveStudents(selectedSubBatchId, studentIds);
                  }}
                />
              )}
              {selectedSubBatchForCourses && (
                <CourseManagementDialog
                  open={selectedSubBatchForCourses !== null}
                  onOpenChange={(open) => !open && setSelectedSubBatchForCourses(null)}
                  subBatchId={selectedSubBatchForCourses}
                  divisionId={division.id}
                  subBatchName={subBatches.find(b => b.id === selectedSubBatchForCourses)?.subBatchName || ''}
                  onSave={async (courseIds) => {
                    await handleSaveCourses(selectedSubBatchForCourses, courseIds);
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}