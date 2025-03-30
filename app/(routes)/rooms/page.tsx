"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, BookOpen, Search } from "lucide-react";
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
import DepartmentSelect from "@/components/custom/DepartmentSelect";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const ROOM_TYPES = ["COMPUTER_LAB", "LECTURE_HALL"];

interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  courseInit: string;
  semester: string;
  type: string;
}

interface Room {
  id: number;
  roomName: string;
  roomType: string;
  compatibleCourses: Course[];
  homeDepartment: {
    id: number;
    name: string;
    acronym: string;
  };
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({});
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (isAssignDialogOpen) {
      fetch(`${API_BASE_URL}/courses`)
        .then((res) => res.json())
        .then((data) => {
          setCourses(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.error("Error fetching courses:", err);
          toast.error("Failed to fetch courses");
        });
    }
  }, [isAssignDialogOpen]);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resourcerooms`);
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    }
  };

  const resetForm = () => {
    setNewRoom({});
    setSelectedDepartmentId("");
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!newRoom.roomName || !newRoom.roomType || !selectedDepartmentId) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing 
        ? `${API_BASE_URL}/resourcerooms/${newRoom.id}?departmentId=${selectedDepartmentId}`
        : `${API_BASE_URL}/resourcerooms/${selectedDepartmentId}`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName: newRoom.roomName,
          roomType: newRoom.roomType,
        }),
      });

      if (!response.ok) throw new Error("Failed to save room");
      
      toast.success(`Room ${isEditing ? "updated" : "created"} successfully`);
      fetchRooms();
      resetForm();
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} room`);
    }
  };

  const handleEdit = (room: Room) => {
    setNewRoom(room);
    setSelectedDepartmentId(String(room.homeDepartment.id));
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/resourcerooms/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete room");
      
      toast.success("Room deleted successfully");
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Failed to delete room");
    }
  };

  const handleAssignDialogOpen = (room: Room) => {
    setSelectedRoom(room);
    setSelectedCourses(room.compatibleCourses.map(c => c.id));
    setIsAssignDialogOpen(true);
  };

  const handleCourseToggle = (courseId: number) => {
    setSelectedCourses(current =>
      current.includes(courseId)
        ? current.filter(id => id !== courseId)
        : [...current, courseId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedRoom) return;

    try {
      // Get existing course IDs
      const existingCourseIds = selectedRoom.compatibleCourses.map(c => c.id);
      
      // Determine courses to add and remove
      const coursesToAdd = selectedCourses.filter(id => !existingCourseIds.includes(id));
      const coursesToRemove = existingCourseIds.filter(id => !selectedCourses.includes(id));

      // Make API calls if there are changes
      if (coursesToAdd.length > 0) {
        await fetch(`${API_BASE_URL}/resourcerooms/${selectedRoom.id}/compatible-courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursesToAdd)
        });
      }

      if (coursesToRemove.length > 0) {
        await fetch(`${API_BASE_URL}/resourcerooms/${selectedRoom.id}/compatible-courses`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursesToRemove)
        });
      }

      // Refresh room data
      const response = await fetch(`${API_BASE_URL}/resourcerooms/${selectedRoom.id}`);
      const updatedRoom = await response.json();
      
      setRooms(rooms.map(r =>
        r.id === selectedRoom.id ? updatedRoom : r
      ));
      
      setIsAssignDialogOpen(false);
      setSearchQuery('');
      toast.success("Compatible courses updated successfully");
    } catch (err) {
      console.error("Error updating compatible courses:", err);
      toast.error('Failed to update compatible courses');
    }
  };

  const filteredCourses = courses.filter(course => 
    course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Resource Rooms</h1>
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DepartmentSelect
            value={selectedDepartmentId}
            onValueChange={(value) => setSelectedDepartmentId(value)}
            placeholder="Select Department"
          />
          <Input
            placeholder="Room Name"
            value={newRoom.roomName || ""}
            onChange={(e) => setNewRoom({ ...newRoom, roomName: e.target.value })}
          />
          <Select 
            value={newRoom.roomType} 
            onValueChange={(value) => setNewRoom({ ...newRoom, roomType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Room Type" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          {isEditing && (
            <Button variant="outline" onClick={resetForm} className="w-full">
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isEditing ? "Update" : "Add"} Room
          </Button>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room Name</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Compatible Courses</TableHead>
              <TableHead className="w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.roomName}</TableCell>
                <TableCell>{room.roomType.replace("_", " ")}</TableCell>
                <TableCell>{room.homeDepartment?.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {room.compatibleCourses.length > 0 ? (
                      room.compatibleCourses.map((course) => (
                        <Badge key={course.id} variant="secondary">
                          {course.courseCode}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No courses assigned
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignDialogOpen(room)}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Courses
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(room)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(room.id)}
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

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Compatible Courses for {selectedRoom?.roomName}</DialogTitle>
            <div className="relative mt-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-[50vh] max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <div key={course.id} 
                  className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedCourses.includes(course.id)}
                    onCheckedChange={() => handleCourseToggle(course.id)}
                  />
                  <div className="flex flex-col">
                    <label className="font-medium">
                      {course.courseCode}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {course.courseName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAssignments}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
