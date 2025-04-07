// app/divisions/[id]/manage/ManageClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";

interface Division {
  id: number;
  identity: string;
  year: number;
  semester: string;
  department: {
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

interface ManageClientProps {
  initialDivision: Division;
  initialStudents: Student[];
  params: { id: string };
}

export default function ManageClient({
  initialDivision,
  initialStudents,
  params
}: ManageClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState(initialStudents);
  const [selectedStudents, setSelectedStudents] = useState<number[]>(initialDivision.studentIds || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:8080/divisions/${params.id}/students`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedStudents),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save student assignments');
      }

      router.push(`/divisions/${params.id}/courses`);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/divisions')}
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to divisions
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {initialDivision.department.acronym} - {initialDivision.identity}
        </h1>
        <p className="text-lg text-muted-foreground">
          Year {initialDivision.year} • Sem {initialDivision.semester}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-semibold">Assign Students</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select students to include in this division
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button 
              onClick={handleSave}
              disabled={selectedStudents.length === 0 || isSaving}
              className="min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue to Courses'
              )}
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedStudents.length} selected
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="border rounded-lg p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No students available
            </p>
          ) : (
            students.map(student => (
              <div 
                key={student.id} 
                className="flex items-center space-x-4 p-3 hover:bg-muted/50 rounded transition-colors"
              >
                <Checkbox
                  id={`student-${student.id}`}
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => handleStudentToggle(student.id)}
                />
                <label 
                  htmlFor={`student-${student.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.rollNumber}</p>
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}