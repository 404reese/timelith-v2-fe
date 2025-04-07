// app/divisions/[divisionId]/autocreate/CreateForm.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface CreateFormProps {
  divisionId: string;
  initialStudents: Array<{ id: string; name: string }>;
  initialCourses: Array<{ id: number; name: string }>;
}

export default function CreateForm({
  divisionId,
  initialStudents,
  initialCourses,
}: CreateFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [batchName, setBatchName] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const requests = selectedCourses.map(async (courseId) => {
        const response = await fetch(
          `/api/periods/${divisionId}/${courseId}/autocreate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              batch: batchName,
              studentGroup: selectedStudents,
            }),
          }
        );

        if (!response.ok) throw new Error(`Course ${courseId} failed`);
        return response.json();
      });

      await Promise.all(requests);
      toast.success('Periods created successfully!');
      router.push(`/divisions/${divisionId}`);
    } catch (error) {
      toast.error('Some creations failed. Check console for details.');
      console.error('Creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Batch Name Input */}
      <div>
        <label className="block mb-2">Batch Name</label>
        <input
          type="text"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {/* Students Multi-select */}
      <div>
        <label className="block mb-2">Select Students</label>
        <select
          multiple
          value={selectedStudents}
          onChange={(e) => 
            setSelectedStudents(Array.from(e.target.selectedOptions, option => option.value))
          }
          className="w-full p-2 border rounded h-32"
        >
          {initialStudents.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      {/* Courses Multi-select */}
      <div>
        <label className="block mb-2">Select Courses</label>
        <select
          multiple
          value={selectedCourses.map(String)}
          onChange={(e) => 
            setSelectedCourses(
              Array.from(e.target.selectedOptions, option => parseInt(option.value))
            )
          }
          className="w-full p-2 border rounded h-32"
        >
          {initialCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isSubmitting ? 'Creating...' : 'Create Periods'}
      </button>
    </form>
  );
}