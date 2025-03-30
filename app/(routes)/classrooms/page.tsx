"use client";

import { useState } from "react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import MultipleSelector, { Option } from '@/components/ui/MultiSelector';

const DEPARTMENTS = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"];
const CLASSROOM_TYPES = ["Computer Lab", "Lecture Hall"];
const COURSES = [
  { label: "Maths", value: "Maths" },
  { label: "DSA", value: "DSA" },
  { label: "Database Management", value: "dbms" },
  { label: "Operating Systems", value: "os" },
  { label: "Artificial Intelligence", value: "ai" },
];

interface Classroom {
  id: string;
  roomName: string;
  capacity: number;
  roomType: string;
  // compatibleCourses will be added later
}

export default function ClassroomPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [newClassroom, setNewClassroom] = useState<Classroom>({
    id: "",
    roomName: "",
    capacity: 0,
    roomType: "",
  });

  const resetForm = () => {
    setNewClassroom({ 
      id: "", 
      roomName: "", 
      capacity: 0, 
      roomType: "" 
    });
  };

  const handleAdd = () => {
    if (!newClassroom.roomName || !newClassroom.capacity || !newClassroom.roomType) return;
    setClassrooms([...classrooms, { ...newClassroom, id: crypto.randomUUID() }]);
    resetForm();
  };

  const handleEdit = (classroom: Classroom) => {
    setNewClassroom(classroom);
  };

  const handleDelete = (id: string) => {
    setClassrooms(classrooms.filter((classroom) => classroom.id !== id));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Classroom Records</h1>
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="flex gap-4 justify-between">
          <Input
            placeholder="Room Name"
            value={newClassroom.roomName}
            onChange={(e) => setNewClassroom({ ...newClassroom, roomName: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Room Capacity"
            value={newClassroom.capacity || ""}
            onChange={(e) => setNewClassroom({ ...newClassroom, capacity: Number(e.target.value) })}
          />
          <Select value={newClassroom.roomType} onValueChange={(value) => setNewClassroom({ ...newClassroom, roomType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              {CLASSROOM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4 items-center mt-4 justify-center">
          <Button
            onClick={handleAdd}
            className="transition-transform hover:scale-105 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Classroom
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Name</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classrooms.map((classroom) => (
              <TableRow key={classroom.id}>
                <TableCell>{classroom.roomName}</TableCell>
                <TableCell>{classroom.capacity}</TableCell>
                <TableCell>{classroom.roomType}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(classroom)}
                      className="transition-colors hover:text-blue-600 hover:border-blue-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(classroom.id)}
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
  );
}
