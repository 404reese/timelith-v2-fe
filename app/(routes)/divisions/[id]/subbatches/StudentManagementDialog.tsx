import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  department?: { name: string };
  year?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subBatchId: number;
  divisionId: number; // Add this prop
  subBatchName: string;
  onSave: (studentIds: number[]) => Promise<void>;
}

export function StudentManagementDialog({
  open,
  onOpenChange,
  subBatchId,
  divisionId,
  subBatchName,
  onSave
}: Props) {
  const [subBatchStudents, setSubBatchStudents] = useState<Student[]>([]);
  const [allDivisionStudents, setAllDivisionStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: 'rollNumber'; direction: 'asc' | 'desc' }>({
    key: 'rollNumber',
    direction: 'asc'
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchAllData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch both subbatch students and division students in parallel
          const [subBatchResponse, divisionResponse] = await Promise.all([
            fetch(`http://localhost:8080/subbatches/${subBatchId}/students`),
            fetch(`http://localhost:8080/divisions/${divisionId}/students`)
          ]);

          if (!subBatchResponse.ok || !divisionResponse.ok) 
            throw new Error('Failed to fetch students');

          const [subBatchData, divisionData] = await Promise.all([
            subBatchResponse.json(),
            divisionResponse.json()
          ]);

          setSubBatchStudents(subBatchData);
          setAllDivisionStudents(divisionData);
          setSelectedStudents(subBatchData.map(student => student.id));
        } catch (err) {
          setError('Failed to load students. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAllData();
    }
  }, [open, subBatchId, divisionId]);

  const { selectedFilteredStudents, unselectedFilteredStudents } = useMemo(() => {
    const filtered = allDivisionStudents.filter(student => {
      const rollNumberStr = String(student.rollNumber);
      const searchLower = searchQuery.toLowerCase();
      
      return rollNumberStr.toLowerCase().includes(searchLower) ||
             student.name.toLowerCase().includes(searchLower);
    });

    const selected = filtered.filter(s => selectedStudents.includes(s.id));
    const unselected = filtered.filter(s => !selectedStudents.includes(s.id));

    // Sort both arrays
    const sorter = (a: Student, b: Student) => {
      const rollA = String(a.rollNumber);
      const rollB = String(b.rollNumber);
      return sortConfig.direction === 'asc' 
        ? rollA.localeCompare(rollB, undefined, { numeric: true })
        : rollB.localeCompare(rollA, undefined, { numeric: true });
    };

    return {
      selectedFilteredStudents: selected.sort(sorter),
      unselectedFilteredStudents: unselected.sort(sorter)
    };
  }, [allDivisionStudents, searchQuery, sortConfig, selectedStudents]);

  const handleSort = () => {
    setSortConfig(prev => ({
      key: 'rollNumber',
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(selectedStudents);
      onOpenChange(false);
    } catch (error) {
      setError('Failed to save student assignments. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const StudentTable = ({ students, title }: { students: Student[], title: string }) => (
    <div className="flex-1 overflow-auto border rounded-md">
      <div className="bg-muted px-4 py-2 font-medium sticky top-0">
        {title} ({students.length})
      </div>
      <table className="w-full">
        <thead className="sticky top-8 bg-background">
          <tr>
            <th className="w-12 px-4 py-3 text-left border-b">
              <Checkbox
                checked={students.length > 0 && 
                  students.every(s => selectedStudents.includes(s.id))}
                onCheckedChange={(checked) => {
                  setSelectedStudents(prev => {
                    const otherSelected = prev.filter(id => 
                      !students.some(s => s.id === id));
                    return checked 
                      ? [...otherSelected, ...students.map(s => s.id)]
                      : otherSelected;
                  });
                }}
              />
            </th>
            <th className="px-4 py-3 text-left border-b">Roll Number</th>
            <th className="px-4 py-3 text-left border-b">Name</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-muted/50 border-b">
              <td className="px-4 py-2">
                <Checkbox
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => {
                    setSelectedStudents(prev => 
                      prev.includes(student.id)
                        ? prev.filter(id => id !== student.id)
                        : [...prev, student.id]
                    );
                  }}
                />
              </td>
              <td className="px-4 py-2 font-medium">{student.rollNumber}</td>
              <td className="px-4 py-2">{student.name}</td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Students - {subBatchName}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 py-4">
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-[400px]"
              />
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>

            {error && (
              <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            <div className="flex-1 flex gap-4 min-h-0">
              <StudentTable 
                students={selectedFilteredStudents} 
                title="Selected Students" 
              />
              <StudentTable 
                students={unselectedFilteredStudents} 
                title="Available Students" 
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
