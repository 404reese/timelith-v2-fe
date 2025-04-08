'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatMinutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const parseDuration = (duration) => {
  // Handle duration in seconds
  if (typeof duration === 'number') return duration / 60; // Convert seconds to minutes
  
  // Keep existing string parsing logic as fallback
  const hours = duration.match(/(\d+)H/)?.[1] || 0;
  const minutes = duration.match(/(\d+)M/)?.[1] || 0;
  return parseInt(hours) * 60 + parseInt(minutes);
};

const ViewTimetable = () => {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await fetch(`http://localhost:8081/time-table/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setTimetableData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [jobId]);

  if (loading) return <div className="p-4">Loading timetable...</div>;
  if (!timetableData) return <div className="p-4">No timetable data available</div>;

  // Process timeslots
  const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Get all unique timeslots across days
  const allTimeslots = timetableData.timeslots
    .map((ts) => ({
      day: ts.dayOfWeek,
      start: parseTimeToMinutes(ts.startTime),
      end: parseTimeToMinutes(ts.startTime) + 60, // Default to 1-hour slots
    }))
    .sort((a, b) => a.start - b.start);

  // Create time columns for grid
  const timeColumns = [...new Set(allTimeslots.map((ts) => ts.start))].sort((a, b) => a - b);

  // Group periods by day
  const groupedPeriods = daysOrder.reduce((acc, day) => {
    acc[day] = timetableData.periods.filter(
      (p) => p.timeslot?.dayOfWeek === day && p.timeslot?.startTime
    );
    return acc;
  }, {});

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {timetableData?.periods[0]?.divisionName.department.acronym} -{' '}
          {timetableData?.periods[0]?.divisionName.identity} Timetable
        </h1>
        <button
          onClick={() => router.push(`/report?jobId=${jobId}`)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          View Report
        </button>
      </div>

      {/* Timetable Grid */}
      <div
        className="grid gap-[1px] bg-gray-200"
        style={{
          gridTemplateColumns: `120px repeat(${timeColumns.length}, minmax(150px, 1fr))`,
        }}
      >
        {/* Header Row */}
        <div className="bg-white sticky left-0 z-20 h-16"></div>
        {timeColumns.map((time, idx) => (
          <div
            key={`time-${idx}`}
            className="bg-white p-2 text-center sticky top-0 z-10 border-b h-16"
          >
            {formatMinutesToTime(time)}
          </div>
        ))}

        {/* Day Rows */}
        {daysOrder.map((day) => (
          <React.Fragment key={day}>
            <div className="bg-white p-2 font-medium sticky left-0 z-20 border-r h-20">
              {day}
            </div>

            {timeColumns.map((colTime, colIdx) => {
              const period = groupedPeriods[day].find((p) => {
                const start = parseTimeToMinutes(p.startTime || p.timeslot.startTime);
                const durationInMinutes = parseDuration(p.duration);
                const end = start + durationInMinutes;
                return start <= colTime && end > colTime;
              });

              return (
                <div
                  key={`${day}-${colIdx}`}
                  className="bg-white relative border-r border-b min-h-[80px]"
                >
                  {period && parseTimeToMinutes(period.timeslot.startTime) === colTime && (
                    <div
                      className="absolute inset-1 bg-blue-50 p-2 rounded border border-blue-200"
                      style={{
                        gridColumn: `${colIdx + 2} / span ${Math.ceil(parseDuration(period.duration) / 60)}`,
                      }}
                    >
                      <div className="text-sm font-semibold truncate">
                        {period.subject.courseCode} - {period.subject.courseName}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {period.instructor?.initials || 'Staff'} | {period.batch}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {period.resourceRoom?.roomName || 'Room'} | {period.subject.type}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Group: {period.studentGroup.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ViewTimetable;