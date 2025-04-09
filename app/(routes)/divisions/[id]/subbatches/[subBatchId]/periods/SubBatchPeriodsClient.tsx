'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Assuming the Period structure is similar for sub-batches
// Adjust this interface if the API response differs
interface Period {
  id: number;
  // Sub-batch might not have divisionName directly, adjust as needed
  // divisionName?: { ... };
  subject: {
    id: number;
    courseCode: string;
    courseName: string;
    courseInit: string;
    semester: string;
    department: {
      id: number;
      name: string;
      acronym: string;
    };
    type: string;
    duration: string;
  };
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  facultyName?: string;
  roomName?: string;
  // Allow other potential properties
  [key: string]: any;
}

interface SubBatchPeriodsClientProps {
  params: {
    id: string; // Division ID (might be needed for back navigation or context)
    subBatchId: string; // Sub-batch ID
  };
}

export default function SubBatchPeriodsClient({ params }: SubBatchPeriodsClientProps) {
  const router = useRouter();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [subBatchName, setSubBatchName] = useState<string>(''); // To display the sub-batch name

  useEffect(() => {
    // Fetch sub-batch details (like name) - Optional, but good for context
    const fetchSubBatchDetails = async () => {
      try {
        // Assuming an endpoint exists to get sub-batch details by ID
        const response = await fetch(`http://localhost:8080/subbatches/${params.subBatchId}`);
        if (response.ok) {
          const data = await response.json();
          setSubBatchName(data.subBatchName || `Sub-batch ${params.subBatchId}`);
        } else {
          setSubBatchName(`Sub-batch ${params.subBatchId}`); // Fallback name
        }
      } catch (error) {
        console.error('Error fetching sub-batch details:', error);
        setSubBatchName(`Sub-batch ${params.subBatchId}`); // Fallback name on error
      }
    };

    const fetchPeriods = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/periods/subbatch/${params.subBatchId}`);
        if (!response.ok) throw new Error(`Failed to fetch periods: ${response.statusText}`);
        const data = await response.json();
        console.log('Fetched sub-batch periods data:', data); // Log the raw data
        if (Array.isArray(data)) {
          setPeriods(data);
        } else {
          console.warn('API did not return an array. Setting periods to empty array.');
          setPeriods([]);
        }
      } catch (error) {
        console.error('Error fetching sub-batch periods:', error);
        setPeriods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubBatchDetails(); // Fetch name first
     fetchPeriods(); // Then fetch periods
   }, [params.subBatchId]);

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
          // Navigate back to the sub-batch management page for the specific division
          onClick={() => router.push(`/divisions/${params.id}/subbatches`)}
          className="flex items-center text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sub-batches
        </Button>
      </div>

      <h1 className="text-3xl font-bold">Schedule for {subBatchName || 'Sub-batch'}</h1>

      {loading ? (
        <div>Loading periods...</div>
      ) : displayPeriods.length === 0 ? (
        <div>No periods found for this sub-batch. Check console for API response details.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPeriods.map((period) => (
            <div
              key={period.id} // Assuming 'id' exists at the top level
              className="bg-card rounded-lg border p-4 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{period.subject?.courseName ?? 'Unknown Course'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {period.facultyName ?? `(${period.subject?.courseCode || period.subject?.type || 'Details N/A'})`}
                  </p>
                </div>
                <span className="text-sm font-medium bg-primary/10 text-primary rounded-full px-2 py-1">
                  {period.dayOfWeek ?? period.subject?.type ?? 'N/A'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {period.startTime && period.endTime
                    ? `${period.startTime} - ${period.endTime}`
                    : period.subject?.duration ?? 'Time N/A'}
                </span>
                <span className="font-medium text-muted-foreground">
                  {period.roomName
                    ? `Room: ${period.roomName}`
                    : 'Room N/A'} {/* Adjusted fallback */}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
