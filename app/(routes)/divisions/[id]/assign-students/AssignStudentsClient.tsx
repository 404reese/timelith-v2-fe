// app/divisions/[id]/assign-students/AssignStudentsClient.tsx
'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'rollNumber'; direction: 'asc' | 'desc' }>({
    key: 'rollNumber',
    direction: 'asc'
  });
  const lastSelected = useRef<number | null>(null);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = initialStudents.filter(student => {
      const rollNumberStr = String(student.rollNumber);
      const searchLower = searchQuery.toLowerCase();
      
      return rollNumberStr.toLowerCase().includes(searchLower) ||
             student.name.toLowerCase().includes(searchLower);
    });

    return filtered.sort((a, b) => {
      const rollA = String(a.rollNumber);
      const rollB = String(b.rollNumber);
      
      if (sortConfig.direction === 'asc') {
        return rollA.localeCompare(rollB, undefined, { numeric: true });
      }
      return rollB.localeCompare(rollA, undefined, { numeric: true });
    });
  }, [initialStudents, searchQuery, sortConfig]);

  const handleSort = (key: 'rollNumber') => {
    setSortConfig(prev => ({
      key,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStudentToggle = (studentId: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelected.current !== null) {
      // Shift+click range selection
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
      // Normal click
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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

        <div className="rounded-md border">
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
                <th 
                  className="px-4 py-3 text-left border-b cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('rollNumber')}
                >
                  <div className="flex items-center gap-2">
                    Roll Number
                    {sortConfig.key === 'rollNumber' && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left border-b">Name</th>
                <th className="px-4 py-3 text-left border-b">Department</th>
                <th className="px-4 py-3 text-left border-b">Year</th>
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
                      onCheckedChange={(e) => handleStudentToggle(student.id, e as React.MouseEvent)}
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
  );
}