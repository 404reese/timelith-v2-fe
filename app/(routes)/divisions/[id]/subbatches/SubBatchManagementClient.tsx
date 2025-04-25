"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, ChevronLeft, Users, BookOpen, Eye } from "lucide-react"; // Added Eye icon
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
  const [courseCounts, setCourseCounts] = useState<Record<number, number>>({});

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

  const fetchCourseCount = async (subBatchId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/periods/subbatch/${subBatchId}/courses`
      );
      const courses = await response.json();
      setCourseCounts(prev => ({
        ...prev,
        [subBatchId]: Array.isArray(courses) ? courses.length : 0
      }));
    } catch (error) {
      console.error(`Error fetching course count for subbatch ${subBatchId}:`, error);
    }
  };

  useEffect(() => {
    subBatches.forEach(batch => {
      if (batch.id) {
        fetchStudentCount(batch.id);
        fetchCourseCount(batch.id);
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
      <div className="flex items-center gap-4 mb-8"> {/* Changed grid to flex */}
        <Input
          placeholder="New Sub-batch Name"
          value={newSubBatch.subBatchName}
          onChange={(e) =>
            setNewSubBatch({ ...newSubBatch, subBatchName: e.target.value })
          }
          className="flex-grow" /* Allow input to take available space */
        />
        <Button
          onClick={editingSubBatchId ? handleUpdateSubBatch : handleCreateSubBatch}
          className="flex-shrink-0" /* Prevent button from shrinking */
        >
          {editingSubBatchId ? "Update Sub-batch" : "Create Sub-batch"}
        </Button>
      </div>

      {/* List of Sub-Batches - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subBatches.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No sub-batches created yet. Use the form above to add one.
          </div>
        ) : (
          subBatches.map((batch) => (
            <div key={batch.id} className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div> {/* Content Area */}
                {/* Title Row */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold">
                    {batch.subBatchName}
                  </h3>
                </div>

                {/* Student Count */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {studentCounts[batch.id!] ?? 'Loading...'} students assigned
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-6 mt-4">
                  <Button
                    variant="secondary"
                    className="w-full border hover:text-blue-600 hover:border-blue-600"
                    onClick={() => handleManageStudents(batch.id!)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Students
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      (studentCounts[batch.id!] ?? 0) === 0
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {studentCounts[batch.id!] ?? 0}
                    </span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full border hover:text-blue-600 hover:border-blue-600"
                    onClick={() => setSelectedSubBatchForCourses(batch.id!)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Assign Courses
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      (courseCounts[batch.id!] ?? 0) === 0
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {courseCounts[batch.id!] ?? 0}
                    </span>
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full border hover:text-blue-600 hover:border-blue-600"
                    onClick={() => router.push(`/divisions/${division.id}/subbatches/${batch.id}/periods`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detailed Period View
                  </Button>
                </div>
              </div>

              {/* Edit/Delete Actions (aligned bottom) */}
              <div className="mt-auto pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSubBatchId(batch.id!);
                    setNewSubBatch(batch);
                  }}
                  className="text-blue-600 hover:border-blue-600"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSubBatch(batch.id!)}
                  className="text-red-600 hover:border-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>

              {/* Dialogs - Rendered outside the card structure but linked */}
              {/* Note: Keeping dialogs here might cause re-renders. Consider moving state up if performance issues arise. */}
              {selectedSubBatchId === batch.id && (
                <StudentManagementDialog
                  open={true} // Controlled by selectedSubBatchId state
                  onOpenChange={(open) => !open && setSelectedSubBatchId(null)}
                  subBatchId={selectedSubBatchId}
                  divisionId={division.id}
                  subBatchName={batch.subBatchName}
                  onSave={async (studentIds) => {
                    await handleSaveStudents(selectedSubBatchId, studentIds);
                  }}
                />
              )}
              {selectedSubBatchForCourses === batch.id && (
                <CourseManagementDialog
                  open={true} // Controlled by selectedSubBatchForCourses state
                  onOpenChange={(open) => !open && setSelectedSubBatchForCourses(null)}
                  subBatchId={selectedSubBatchForCourses}
                  divisionId={division.id}
                  subBatchName={batch.subBatchName}
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
