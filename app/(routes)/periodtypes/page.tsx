"use client";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

const formatDuration = (duration: string) => {
  const hours = duration.match(/PT(\d+)H/)?.[1];
  if (hours) {
    return `${hours} ${hours === '1' ? 'Hour' : 'Hours'}`;
  }
  return duration;
};

interface Periodicity {
  id: number;
  type: string;
  duration: string;
  numberOfLecturesPerWeek: number;
}

export default function PeriodType() {
  const [periodicities, setPeriodicities] = useState<Periodicity[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPeriodicity, setNewPeriodicity] = useState<Omit<Periodicity, "id">>({
    type: "",
    duration: "",
    numberOfLecturesPerWeek: 1
  });

  const fetchPeriodicities = () => {
    fetch(`${API_BASE_URL}/periodicities`)
      .then((res) => res.json())
      .then((data) => {
        setPeriodicities(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error fetching periodicities:", err));
  };

  useEffect(() => {
    fetchPeriodicities();
  }, []);

  const handleAdd = () => {
    if (!newPeriodicity.type) return;

    fetch(`${API_BASE_URL}/periodicities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPeriodicity),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to add');
        const text = await res.text(); // Get response as text first
        return text ? JSON.parse(text) : {}; // Parse only if there's content
      })
      .then(() => {
        fetchPeriodicities(); // Fetch updated list
        setNewPeriodicity({ // Reset form
          type: "",
          duration: "",
          numberOfLecturesPerWeek: 1
        });
        toast.success("Period type added successfully", {
          style: { background: '#22c55e', color: 'white' }
        });
      })
      .catch((err) => {
        console.error("Error adding periodicity:", err);
        toast.error("Failed to add period type");
      });
  };

  const handleUpdate = () => {
    if (!editingId) return;

    fetch(`${API_BASE_URL}/periodicities/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPeriodicity),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to update');
        const text = await res.text();
        return text ? JSON.parse(text) : {};
      })
      .then(() => {
        fetchPeriodicities(); // Fetch updated list
        setEditingId(null);
        setNewPeriodicity({ // Reset form
          type: "",
          duration: "",
          numberOfLecturesPerWeek: 1
        });
        toast.success("Period type updated successfully", {
          style: { background: '#3b82f6', color: 'white' }
        });
      })
      .catch((err) => {
        console.error("Error updating periodicity:", err);
        toast.error("Failed to update period type");
      });
  };

  const handleDelete = (id: number) => {
    fetch(`${API_BASE_URL}/periodicities/${id}`, { method: "DELETE" })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to delete');
        try {
          const text = await res.text();
          if (text) JSON.parse(text); // Try to parse if there's content, but don't use the result
        } catch (e) {
          // Ignore parsing errors for DELETE responses
        }
        fetchPeriodicities(); // Fetch updated list
        toast.success("Period type deleted successfully", {
          style: { background: '#ef4444', color: 'white' }
        });
      })
      .catch((err) => {
        console.error("Error deleting periodicity:", err);
        toast.error("Failed to delete period type");
      });
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Period Types Record</h1>
        <p className="text-muted-foreground">Types of periods such as Lecture, Lab, Elective should be created here to be used in the courses for type</p>

        <div className="space-y-4 p-4 rounded-lg border bg-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              placeholder="Period Type" 
              value={newPeriodicity.type} 
              onChange={(e) => setNewPeriodicity({ 
                ...newPeriodicity, 
                type: e.target.value 
              })} 
            />
            <Select 
              value={newPeriodicity.duration} 
              onValueChange={(value) => setNewPeriodicity({ 
                ...newPeriodicity, 
                duration: value 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PT1H">1 Hour</SelectItem>
                <SelectItem value="PT2H">2 Hours</SelectItem>
                <SelectItem value="PT3H">3 Hours</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={String(newPeriodicity.numberOfLecturesPerWeek)} 
              onValueChange={(value) => setNewPeriodicity({ 
                ...newPeriodicity, 
                numberOfLecturesPerWeek: parseInt(value) 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No. of Lectures per Week" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={String(num)}>
                    {num} per week
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={editingId ? handleUpdate : handleAdd} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {editingId ? "Update Period Type" : "Add Period Type"}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Lectures per Week</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periodicities.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>{period.type}</TableCell>
                  <TableCell>{formatDuration(period.duration)}</TableCell>
                  <TableCell>{period.numberOfLecturesPerWeek}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingId(period.id);
                          setNewPeriodicity(period);
                        }} 
                        className="transition-colors hover:text-blue-600 hover:border-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleDelete(period.id)} 
                        className="transition-colors hover:text-red-600 hover:border-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'mt-[4rem]', // Add margin-top to account for navbar
          style: {
            background: 'white',
            color: 'black',
          },
        }}
      />
    </>
  );
}
