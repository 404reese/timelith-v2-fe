"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface Break {
  startTime: string;
  endTime: string;
}

interface Timeframe {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breaks: Break[];
}

export default function TimeslotPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [numBreaks, setNumBreaks] = useState<number>(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breaks, setBreaks] = useState<Break[]>([]);

  useEffect(() => {
    fetchTimeframes();
  }, []);

  const fetchTimeframes = async () => {
    try {
      const response = await fetch("http://localhost:8080/timeframe");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      const formattedTimeframes = data.timeBounds.map((tb: any) => ({
        dayOfWeek: tb.dayOfWeek,
        startTime: data.timeslots.find((ts: any) => ts.dayOfWeek === tb.dayOfWeek)?.startTime || "",
        endTime: tb.endTime,
        breaks: data.recesses.filter((br: any) => br.dayOfWeek === tb.dayOfWeek) || []
      }));
      
      setTimeframes(formattedTimeframes);
    } catch (error) {
      console.error("Error fetching timeframes:", error);
    }
  };

  const handleDaySelection = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAddTimeslot = async () => {
    const newEntries = selectedDays.map((day) => ({
      dayOfWeek: day.toUpperCase(),
      startTime: startTime + ":00",
      endTime: endTime + ":00",
      breaks: breaks.map(breakItem => ({
        dayOfWeek: day.toUpperCase(),
        startTime: breakItem.startTime + ":00",
        endTime: breakItem.endTime + ":00"
      })),
    }));

    try {
      for (const entry of newEntries) {
        await fetch("http://localhost:8080/timeframe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      }
      fetchTimeframes();
    } catch (error) {
      console.error("Error adding timeslot:", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Timeslot Management</h1>
      <div className="p-4 rounded-lg border bg-card space-y-4">
        <div>
          <label className="font-semibold">Select Days:</label>
          <div className="flex gap-4 mt-2">
            {DAYS.map((day) => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDaySelection(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          <label className="font-semibold">Start Time:</label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <label className="font-semibold">End Time:</label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <div className="flex gap-4 items-center">
          <label className="font-semibold">Number of Breaks:</label>
          <Input
            type="number"
            min="0"
            value={numBreaks}
            onChange={(e) => setNumBreaks(Number(e.target.value))}
            className="max-w-[80px]"
          />
        </div>

        {numBreaks > 0 && (
          <div className="mt-4 p-2 border rounded-lg">
            <label className="font-semibold">Break Timings:</label>
            {Array.from({ length: numBreaks }).map((_, index) => (
              <div key={index} className="flex gap-4 items-center mt-2">
                <label>Start Time:</label>
                <Input
                  type="time"
                  value={breaks[index]?.startTime || ""}
                  onChange={(e) => {
                    const newBreaks = [...breaks];
                    newBreaks[index] = {
                      ...newBreaks[index],
                      startTime: e.target.value,
                    };
                    setBreaks(newBreaks);
                  }}
                />
                <label>End Time:</label>
                <Input
                  type="time"
                  value={breaks[index]?.endTime || ""}
                  onChange={(e) => {
                    const newBreaks = [...breaks];
                    newBreaks[index] = {
                      ...newBreaks[index],
                      endTime: e.target.value,
                    };
                    setBreaks(newBreaks);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleAddTimeslot} className="transition-transform hover:scale-105 hover:bg-primary/90">
          Add Timeslot
        </Button>
      </div>

      {/* Timeslot Table */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Timeslot Records</h2>
        {timeframes.length > 0 ? (
          <table className="w-full border mt-4">
            <thead>
              <tr className="text-primary bg-primary/10">
                <th className="border px-4 py-2">Day</th>
                <th className="border px-4 py-2">Start Time</th>
                <th className="border px-4 py-2">End Time</th>
                <th className="border px-4 py-2">Break 1 Start</th>
                <th className="border px-4 py-2">Break 1 End</th>
                <th className="border px-4 py-2">Break 2 Start</th>
                <th className="border px-4 py-2">Break 2 End</th>
              </tr>
            </thead>
            <tbody>
              {timeframes.map((frame) => (
                <tr key={frame.dayOfWeek} className="border">
                  <td className="border px-4 py-2">{frame.dayOfWeek}</td>
                  <td className="border px-4 py-2">{frame.startTime}</td>
                  <td className="border px-4 py-2">{frame.endTime}</td>
                  {frame.breaks.map((br, i) => (
                    <>
                      <td key={i + "start"} className="border px-4 py-2">{br.startTime}</td>
                      <td key={i + "end"} className="border px-4 py-2">{br.endTime}</td>
                    </>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No timeslot records available.</p>
        )}
      </div>
    </div>
  );
}
