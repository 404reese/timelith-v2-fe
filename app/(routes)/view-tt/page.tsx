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
  const [selectedDivision, setSelectedDivision] = useState('');
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
        // Set default division to first found
        if (data?.periods?.length > 0) {
          setSelectedDivision(data.periods[0].divisionName.identity);
        }
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

  // Extract unique divisions
  const divisions = Array.from(
    new Map(
      timetableData.periods.map((p) => [
        p.divisionName.identity,
        {
          identity: p.divisionName.identity,
          department: p.divisionName.department.acronym,
          semester: p.divisionName.semester,
        },
      ])
    ).values()
  );

  // Filter periods for selected division
  const filteredPeriods = timetableData.periods.filter(
    (p) => p.divisionName.identity === selectedDivision
  );

  // Process timeslots for filtered periods only
  const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Get all unique timeslots across days for filtered periods
  const allTimeslots = filteredPeriods
    .map((p) => ({
      day: p.timeslot?.dayOfWeek,
      start: p.timeslot ? parseTimeToMinutes(p.timeslot.startTime) : null,
      end: p.timeslot ? parseTimeToMinutes(p.timeslot.startTime) + 60 : null,
    }))
    .filter((ts) => ts.start !== null)
    .sort((a, b) => a.start - b.start);

  // Create time columns for grid
  const timeColumns = [...new Set(allTimeslots.map((ts) => ts.start))].sort((a, b) => a - b);

  // Group periods by day for filtered periods
  const groupedPeriods = daysOrder.reduce((acc, day) => {
    acc[day] = filteredPeriods.filter(
      (p) => p.timeslot?.dayOfWeek === day && p.timeslot?.startTime
    );
    return acc;
  }, {});

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {filteredPeriods[0]?.divisionName.department.acronym} -{' '}
            {filteredPeriods[0]?.divisionName.identity} Timetable
          </h1>
          <div className="mt-2">
            <label className="mr-2 font-medium">Select Division:</label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {divisions.map((div) => (
                <option key={div.identity} value={div.identity}>
                  {div.department} - {div.identity} (Sem {div.semester})
                </option>
              ))}
            </select>
          </div>
        </div>
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
              // Find all periods that overlap with this cell's time slot
              const periodsAtCell = groupedPeriods[day].filter((p) => {
                const start = parseTimeToMinutes(p.timeslot.startTime);
                const durationInMinutes =
                  p.subject.type === 'Practical' ? 120 : parseDuration(p.duration);
                const end = start + durationInMinutes;
                return start <= colTime && end > colTime;
              });

              return (
                <div
                  key={`${day}-${colIdx}`}
                  className="bg-white relative border-r border-b min-h-[80px]"
                >
                  {periodsAtCell.map((period, idx) => (
                    <div
                      key={period.id || idx}
                      className={`absolute inset-1 p-2 rounded border ${
                        period.subject.type === 'Practical'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                      style={{
                        gridColumn: `${colIdx + 2} / span ${
                          period.subject.type === 'Practical'
                            ? 2
                            : Math.ceil(parseDuration(period.duration) / 60)
                        }`,
                        position: "relative",
                      }}
                    >
                      <div className="text-sm font-semibold break-words">
                        {period.subject.courseCode} - {period.subject.courseName}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {period.instructor?.initials || 'Staff'} | {period.batch}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {period.resourceRoom?.roomName || 'Room'} | {period.subject.type}
                      </div>
                    </div>
                  ))}
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