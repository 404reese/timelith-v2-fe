import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  courseInit: string;
  semester: string;
  type: string;
  department: {
    id: number;
    name: string;
    acronym: string;
  };
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subBatchId: number;
  subBatchName: string;
  divisionId: number;
  onSave: (courseIds: number[]) => Promise<void>;
}

const CourseCard = ({ course }: { course: Course }) => (
  <div className="flex flex-col">
    <span className="font-medium">{course.courseName}</span>
    <div className="text-sm text-muted-foreground">
      <span className="mr-2">{course.courseCode}</span>
      <span className="mr-2">•</span>
      <span className="mr-2">{course.type}</span>
      <span className="mr-2">•</span>
      <span>Sem {course.semester}</span>
    </div>
  </div>
);

export function CourseManagementDialog({
  open,
  onOpenChange,
  subBatchId,
  subBatchName,
  divisionId,
  onSave,
}: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all courses
        const coursesResponse = await fetch('http://localhost:8080/courses');
        if (!coursesResponse.ok) throw new Error('Failed to fetch courses');
        const allCourses = await coursesResponse.json();
        setCourses(allCourses);

        // Fetch selected courses for this subbatch using the new endpoint
        const selectedResponse = await fetch(`http://localhost:8080/periods/subbatch/${subBatchId}/courses`);
        if (!selectedResponse.ok) throw new Error('Failed to fetch selected courses');
        const selectedData = await selectedResponse.json();
        setSelectedCourses(selectedData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(message);
        console.error('Error:', message);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, subBatchId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // First save course associations
      await onSave(selectedCourses.map(course => course.id));
      
      // Log the divisionId to verify it's available
      console.log('Division ID:', divisionId);
      
      // Call autocreate endpoint for each selected course with the correct divisionId
      const results = await Promise.all(
        selectedCourses.map(course => 
          fetch(
            `http://localhost:8080/periods/${divisionId}/${course.id}/${subBatchId}/autocreate`,
            { 
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            }
          )
        )
      );
      
      // Check for any failed requests
      const failedCourses = results
        .map((response, index) => ({ response, course: selectedCourses[index] }))
        .filter(({ response }) => !response.ok);

      if (failedCourses.length > 0) {
        const courseNames = failedCourses.map(({ course }) => course.courseName).join(', ');
        throw new Error(`Failed to create timetable slots for: ${courseNames}`);
      }

      setSuccess('Courses saved and timetable slots created successfully');
      console.log('Success:', 'Courses saved and timetable slots created successfully');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save courses';
      setError(message);
      console.error('Error:', message, 'Division ID:', divisionId);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCourse = (course: Course) => {
    setSelectedCourses(prev =>
      prev.find(s => s.id === course.id)
        ? prev.filter(s => s.id !== course.id)
        : [...prev, course]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Courses - {subBatchName}</DialogTitle>
        </DialogHeader>
        
        {/* Error/Success messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <div>Loading courses...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 h-[500px]">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Selected Courses</h3>
              <ScrollArea className="h-[400px]">
                {selectedCourses.length === 0 ? (
                  <div className="text-muted-foreground text-center py-4">
                    No courses selected
                  </div>
                ) : (
                  selectedCourses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-2 hover:bg-slate-100 rounded">
                      <CourseCard course={course} />
                      <Button variant="ghost" size="sm" onClick={() => handleToggleCourse(course)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Available Courses</h3>
              <ScrollArea className="h-[400px]">
                {courses
                  .filter(course => !selectedCourses.find(s => s.id === course.id))
                  .map(course => (
                    <div key={course.id} className="flex items-center justify-between p-2 hover:bg-slate-100 rounded">
                      <CourseCard course={course} />
                      <Button variant="ghost" size="sm" onClick={() => handleToggleCourse(course)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </ScrollArea>
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}