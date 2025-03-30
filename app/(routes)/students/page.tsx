"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, ArrowDownUp } from "lucide-react";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const YEARS = [1, 2, 3, 4];

interface Department {
    id: number;
    name: string;
    acronym: string;
}

interface Student {
    id: number;
    name: string;
    rollNumber: string;
    year: number;
    department: Department;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState<Partial<Student>>({});
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
    const [sortColumn, setSortColumn] = useState<'name' | 'rollNumber' | null>(null);
    const [filterYear, setFilterYear] = useState<number | null>(null);
    const [filterDepartmentId, setFilterDepartmentId] = useState<string>("");

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/students`);
            const data = await response.json();
            setStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to fetch students");
        }
    };

    const resetForm = () => {
        setNewStudent({});
        setSelectedDepartmentId("");
        setIsEditing(false);
    };

    const handleSubmit = async () => {
        if (!newStudent.name || !newStudent.rollNumber || !newStudent.year || !selectedDepartmentId) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing
                ? `${API_BASE_URL}/students/${newStudent.id}?departmentId=${selectedDepartmentId}`
                : `${API_BASE_URL}/students/${selectedDepartmentId}`;

            const body = JSON.stringify({
                name: newStudent.name,
                rollNumber: newStudent.rollNumber,
                year: newStudent.year,
            });

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error saving student:", errorData);
                throw new Error(`Failed to save student: ${response.statusText}`);
            }

            toast.success(`Student ${isEditing ? "updated" : "created"} successfully`);
            fetchStudents();
            resetForm();
        } catch (error: any) {
            console.error("Error saving student:", error);
            toast.error(`Failed to ${isEditing ? "update" : "create"} student: ${error.message}`);
        }
    };

    const handleEdit = (student: Student) => {
        setNewStudent({
            id: student.id,
            name: student.name,
            rollNumber: student.rollNumber,
            year: student.year,
        });
        setSelectedDepartmentId(String(student.department.id));
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/students/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error deleting student:", errorData);
                throw new Error(`Failed to delete student: ${response.statusText}`);
            }

            toast.success("Student deleted successfully");
            fetchStudents();
        } catch (error: any) {
            console.error("Error deleting student:", error);
            toast.error(`Failed to delete student: ${error.message}`);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSort = (column: 'name' | 'rollNumber') => {
        if (sortColumn === column && sortOrder === 'asc') {
            setSortOrder('desc');
        } else if (sortColumn === column && sortOrder === 'desc') {
            setSortOrder(null);
            setSortColumn(null);
        } else {
            setSortOrder('asc');
            setSortColumn(column);
        }
    };

    const handleFilterYearChange = (value: string) => {
      setFilterYear(value === "all" ? null : parseInt(value));
  };

    const handleFilterDepartmentChange = (value: string) => {
        setFilterDepartmentId(value);
    };

    const sortedAndFilteredStudents = () => {
        let filtered = students;

        if (filterYear !== null) {
            filtered = filtered.filter(student => student.year === filterYear);
        }

        if (filterDepartmentId !== "") {
            filtered = filtered.filter(student => String(student.department.id) === filterDepartmentId);
        }

        if (searchQuery) {
            filtered = filtered.filter(student =>
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortColumn === 'name') {
            if (sortOrder === 'asc') {
                filtered.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortOrder === 'desc') {
                filtered.sort((a, b) => b.name.localeCompare(a.name));
            }
        } else if (sortColumn === 'rollNumber') {
            if (sortOrder === 'asc') {
                filtered.sort((a, b) => String(a.rollNumber).localeCompare(String(b.rollNumber)));
            } else if (sortOrder === 'desc') {
                filtered.sort((a, b) => String(b.rollNumber).localeCompare(String(a.rollNumber)));
            }
        }

        return filtered;
    };

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold">Students</h1>
            <div className="space-y-4 p-4 rounded-lg border bg-card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <DepartmentSelect
                        value={selectedDepartmentId}
                        onValueChange={(value) => setSelectedDepartmentId(value)}
                        placeholder="Select Department"
                    />
                    <Input
                        placeholder="Student Name"
                        value={newStudent.name || ""}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    />
                    <Input
                        placeholder="Roll Number"
                        value={newStudent.rollNumber || ""}
                        onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                    />
                    <Select
                        value={newStudent.year ? String(newStudent.year) : undefined}
                        onValueChange={(value) => setNewStudent({ ...newStudent, year: parseInt(value) })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((year) => (
                                <SelectItem key={year} value={String(year)}>
                                    {year}
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
                        {isEditing ? "Update" : "Add"} Student
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="relative">
                <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Filter by name or roll number..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10"
                />
            </div>
            <div>
                <Select onValueChange={handleFilterYearChange} value={filterYear !== null ? String(filterYear) : ""}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {YEARS.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                                Year {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
                    <div>
                        <DepartmentSelect
                            value={filterDepartmentId}
                            onValueChange={handleFilterDepartmentChange}
                            placeholder="Filter by Department"
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                Name
                                <ArrowDownUp className="ml-2 inline-block h-4 w-4" />
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort('rollNumber')}>
                                Roll Number
                                <ArrowDownUp className="ml-2 inline-block h-4 w-4" />
                            </TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="w-[200px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedAndFilteredStudents().map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>{student.rollNumber}</TableCell>
                                <TableCell>{student.year}</TableCell>
                                <TableCell>{student.department?.name}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(student)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(student.id)}
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