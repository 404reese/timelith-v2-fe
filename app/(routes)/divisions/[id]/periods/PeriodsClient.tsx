'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Updated interface based on the actual API response structure
interface Period {
  id: number;
  divisionName: {
    id: number;
    year: number;
    yearInWords: string | null;
    identity: string;
    semester: string;
    academicYear: string;
    department: {
      id: number;
      name: string;
      acronym: string;
    };
    batch: string;
  };
  subject: {
    id: number;
    courseCode: string;
    courseName: string;
    courseInit: string;
    semester: string; // Note: semester exists here too
    department: { // Note: department exists here too
      id: number;
      name: string;
      acronym: string;
    };
    type: string;
    duration: string;
  };
  // Fields that seem to be missing based on the provided log:
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  facultyName?: string;
  roomName?: string;
  // Allow other potential properties if the structure varies
  [key: string]: any;
}

interface PeriodsClientProps {
  params: {
    id: string;
  };
}

export default function PeriodsClient({ params }: PeriodsClientProps) {
  const router = useRouter();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriods = async () => {
      try {
        const response = await fetch(`http://localhost:8080/periods/division/${params.id}`);
        if (!response.ok) throw new Error(`Failed to fetch periods: ${response.statusText}`);
        const data = await response.json();
        console.log('Fetched periods data:', data); // Log the raw data
        // Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setPeriods(data);
        } else {
          console.warn('API did not return an array. Setting periods to empty array.');
          setPeriods([]); // Set to empty array if response is not an array
        }
      } catch (error) {
        console.error('Error fetching periods:', error);
        setPeriods([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

     fetchPeriods();
   }, [params.id]);

   // Sort periods alphabetically by course name
   const sortedPeriods = [...periods].sort((a, b) => {
     const courseNameA = a.subject?.courseName?.toLowerCase() ?? '';
     const courseNameB = b.subject?.courseName?.toLowerCase() ?? '';
     return courseNameA.localeCompare(courseNameB);
   });

   const displayPeriods = sortedPeriods; // Use the sorted array

   return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Divisions
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Division Schedule</h1>

      {loading ? (
        <div>Loading periods...</div>
      ) : displayPeriods.length === 0 ? (
        <div>No periods found for this division. Check console for API response details.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPeriods.map((period) => (
            <div 
              key={period.id} // Assuming 'id' exists at the top level
              className="bg-card rounded-lg border p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  {/* Access courseName from the nested subject object */}
                  <h3 className="font-semibold text-lg">{period.subject?.courseName ?? 'Unknown Course'}</h3>
                  {/* Display Course Code or Type if Faculty is missing */}
                  <p className="text-sm text-muted-foreground">
                    {period.facultyName ?? `(${period.subject?.courseCode || period.subject?.type || 'Details N/A'})`}
                  </p>
                </div>
                {/* Display Subject Type or Division Identity if Day is missing */}
                <span className="text-sm font-medium bg-primary/10 text-primary rounded-full px-2 py-1">
                  {period.dayOfWeek ?? period.subject?.type ?? period.divisionName?.identity ?? 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                {/* Display Duration if Start/End Time are missing */}
                <span className="text-muted-foreground">
                  {period.startTime && period.endTime 
                    ? `${period.startTime} - ${period.endTime}`
                    : period.subject?.duration ?? 'Time N/A'}
                </span>
                {/* Display Batch or Semester if Room is missing */}
                <span className="font-medium text-muted-foreground">
                  {period.roomName 
                    ? `Room: ${period.roomName}`
                    : `Batch: ${period.divisionName?.batch ?? period.divisionName?.semester ?? 'N/A'}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
