'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowLeft } from "lucide-react";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  semester: number;
  department: {
    name: string;
    acronym: string;
  };
}

interface Division {
  id: number;
  identity: string;
  year: number;
  semester: string;
  department: {
    name: string;
    acronym: string;
  };
  courseIds: number[];
}

interface CoursesClientProps {
  initialDivision: Division;
  initialCourses: Course[];
  params: { id: string };
}

export default function CoursesClient({
  initialDivision,
  initialCourses,
  params
}: CoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourses, setSelectedCourses] = useState<number[]>(initialDivision.courseIds || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(''); // New state for filter

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:8080/divisions/${params.id}/courses`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedCourses),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save course assignments');
      }

      router.push('/divisions');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter courses based on department name
  const filteredCourses = courses.filter(course =>
    course.department.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <div className="mb-6">
        <button 
          onClick={() => router.push(`/divisions/${params.id}/manage`)}
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to students
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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Assign Courses</h2>
        <p className="text-sm text-muted-foreground">
          Select courses for this division
        </p>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {/* Add filter input */}
        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Filter by department..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300 w-full"
          />
        </div>

        <div className="border rounded-lg p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {filteredCourses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No courses match the filter
            </p>
          ) : (
            filteredCourses.map(course => (
              <div 
                key={course.id} 
                className="flex items-center space-x-4 p-3 hover:bg-muted/50 rounded transition-colors"
              >
                <Checkbox
                  id={`course-${course.id}`}
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={() => handleCourseToggle(course.id)}
                />
                <label 
                  htmlFor={`course-${course.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <p className="font-medium">{course.courseCode} - {course.courseName}</p>
                  <p className="text-sm text-muted-foreground">
                    Semester {course.semester} • {course.department.name}
                  </p>
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/divisions')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedCourses.length} selected
            </span>
            <Button 
              onClick={handleSave}
              disabled={selectedCourses.length === 0 || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Courses'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}