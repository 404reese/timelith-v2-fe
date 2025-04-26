"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Eye } from "lucide-react";

interface Timetable {
  id: string;
  name: string;
  credits: number;
  created: string;
}

export default function AllTimetablesPage() {
  const [selectedTimetable, setSelectedTimetable] = useState("");
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const response = await fetch("http://localhost:8081/time-table");
        if (!response.ok) throw new Error("Failed to fetch timetables");
        const data = await response.json();
        // Transform the API response into Timetable objects
        const formattedTimetables = data.map((id: string, index: number) => ({
          id,
          name: `Timetable ${index + 1}`,
          credits: Math.floor(Math.random() * 30) + 10,
          created: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        setTimetables(formattedTimetables);
      } catch (error) {
        console.error("Error fetching timetables:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetables();
  }, []);

  if (loading) return <div className="p-6">Loading timetables...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">All Timetables</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Timetables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timetables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timetables.reduce((sum, timetable) => sum + timetable.credits, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timetables.length > 0 
                ? new Date(timetables[0].created).toLocaleDateString() 
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Selection */}
      <div className="flex items-center gap-4">
        <Select value={selectedTimetable} onValueChange={setSelectedTimetable}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a timetable" />
          </SelectTrigger>
          <SelectContent>
            {timetables.map((timetable) => (
              <SelectItem key={timetable.id} value={timetable.id}>
                {timetable.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button 
          disabled={!selectedTimetable}
          onClick={() => router.push(`/view-tt?jobId=${selectedTimetable}`)}
        >
          View Timetable
        </Button>
      </div>

      {/* Timetable Details Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timetable Name</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timetables.map((timetable) => (
              <TableRow key={timetable.id}>
                <TableCell className="font-medium">{timetable.name}</TableCell>
                <TableCell>{timetable.credits}</TableCell>
                <TableCell>{timetable.created}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/report?jobId=${timetable.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Analysis
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}