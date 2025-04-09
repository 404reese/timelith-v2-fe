// app/divisions/[id]/assign-students/AssignStudentsClient.tsx
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

type SortKey = 'rollNumber' | 'name' | 'department' | 'year';

export default function AssignStudentsClient({
  initialDivision,
  initialStudents,
  params
}: {
  initialDivision: any;
  initialStudents: any[];
  params: { id: string };
}) {
  const router = useRouter();
  const [selectedStudents, setSelectedStudents] = useState<number[]>(
    initialDivision.studentIds?.map((id: any) => Number(id)) || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'rollNumber',
    direction: 'asc'
  });
  const lastSelected = useRef<number | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        const response = await fetch(`http://localhost:8080/divisions/${params.id}/students`);
        if (!response.ok) throw new Error('Failed to fetch assigned students');
        const data = await response.json();
        setAssignedStudents(data);
      } catch (error) {
        console.error('Error fetching assigned students:', error);
      } finally {
        setLoadingAssigned(false);
      }
    };
    fetchAssignedStudents();
  }, [params.id]);

  const sortedStudents = (students: any[]) => {
    return students.sort((a, b) => {
      switch (sortConfig.key) {
        case 'rollNumber':
          const rollA = String(a.rollNumber);
          const rollB = String(b.rollNumber);
          return sortConfig.direction === 'asc' 
            ? rollA.localeCompare(rollB, undefined, { numeric: true })
            : rollB.localeCompare(rollA, undefined, { numeric: true });
        case 'name':
          return sortConfig.direction === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'department':
          return sortConfig.direction === 'asc'
            ? (a.department?.acronym || '').localeCompare(b.department?.acronym || '')
            : (b.department?.acronym || '').localeCompare(a.department?.acronym || '');
        case 'year':
          return sortConfig.direction === 'asc'
            ? a.year - b.year
            : b.year - a.year;
        default:
          return 0;
      }
    });
  };

  const filteredStudents = useMemo(() => {
    let filtered = initialStudents.filter(student => {
      const rollNumberStr = String(student.rollNumber);
      const searchLower = searchQuery.toLowerCase();
      return rollNumberStr.toLowerCase().includes(searchLower) ||
             student.name.toLowerCase().includes(searchLower);
    });
    return sortedStudents(filtered);
  }, [initialStudents, searchQuery, sortConfig]);

  const sortedAssignedStudents = useMemo(() => {
    return sortedStudents([...assignedStudents]);
  }, [assignedStudents, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStudentToggle = (studentId: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelected.current !== null) {
      const currentIndex = filteredStudents.findIndex(s => s.id === studentId);
      const lastIndex = filteredStudents.findIndex(s => s.id === lastSelected.current);
      
      const start = Math.min(currentIndex, lastIndex);
      const end = Math.max(currentIndex, lastIndex);
      
      const rangeStudents = filteredStudents.slice(start, end + 1).map(s => s.id);
      
      setSelectedStudents(prev => {
        const newSelection = [...prev];
        rangeStudents.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      setSelectedStudents(prev => 
        prev.includes(studentId)
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
      lastSelected.current = studentId;
    }
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

      if (!response.ok) throw new Error('Failed to save student assignments');
      router.push('/divisions');
    } catch (err) {
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (studentIds: number[]) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:8080/divisions/${params.id}/students`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(studentIds),
        }
      );

      if (!response.ok) throw new Error('Failed to remove students');
      
      const updatedAssigned = assignedStudents.filter(
        student => !studentIds.includes(student.id)
      );
      setAssignedStudents(updatedAssigned);
      setSelectedStudents(prev => prev.filter(id => !studentIds.includes(id)));
    } catch (err) {
      setError('Failed to remove students. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th 
      className="px-4 py-3 text-left border-b cursor-pointer hover:bg-muted/50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <button 
          onClick={() => router.push('/divisions')}
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to divisions
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">
          Assign Students - {initialDivision.identity}
        </h1>
        <p className="text-lg text-muted-foreground">
          {initialDivision.department?.name}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between gap-4">
          <Input
            placeholder="Search by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-[400px]"
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedStudents.length} selected
            </span>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[160px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Assignments'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
<div className="text-sm text-muted-foreground mb-2">
  Click on table headers to sort. Hold Shift and click to select a range of students.
</div>
        <div className="grid grid-cols-2 gap-4">
          {/* Selected Students Table */}
          <div className="rounded-md border">
            <h2 className="p-4 font-semibold text-lg border-b">Selected Students</h2>
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr>
                  <SortableHeader label="Roll Number" sortKey="rollNumber" />
                  <SortableHeader label="Name" sortKey="name" />
                  <SortableHeader label="Year" sortKey="year" />
                  <th className="px-4 py-3 text-left border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssignedStudents.length > 0 ? (
                  sortedAssignedStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/50 border-b">
                      <td className="px-4 py-2 font-medium">{String(student.rollNumber)}</td>
                      <td className="px-4 py-2">{student.name}</td>
                      <td className="px-4 py-2">{student.year}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDelete([student.id])}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      No students selected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* All Students Table */}
          <div className="rounded-md border">
            <h2 className="p-4 font-semibold text-lg border-b">All Students</h2>
            <table className="w-full">
              <thead className="sticky top-0 bg-background">
                <tr>
                  <th className="w-12 px-4 py-3 text-left border-b">
                    <Checkbox
                      checked={filteredStudents.length > 0 && 
                        filteredStudents.every(s => selectedStudents.includes(s.id))}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedStudents(filteredStudents.map(s => s.id));
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                    />
                  </th>
                  <SortableHeader label="Roll Number" sortKey="rollNumber" />
                  <SortableHeader label="Name" sortKey="name" />
                  <SortableHeader label="Department" sortKey="department" />
                  <SortableHeader label="Year" sortKey="year" />
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id}
                    className="hover:bg-muted/50 border-b"
                  >
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(e) => {
                          // Create a synthetic mouse event to handle shift-click
                          const syntheticEvent = {
                            shiftKey: window.event?.shiftKey || false
                          } as React.MouseEvent;
                          handleStudentToggle(student.id, syntheticEvent);
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{String(student.rollNumber)}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.department?.acronym}</td>
                    <td className="px-4 py-2">{student.year}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}