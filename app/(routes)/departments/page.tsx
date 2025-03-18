"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Department {
  id: number;
  name: string;
  acronym: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/departments`;

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState({ name: "", acronym: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data: Department[] = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleAdd = async () => {
    if (!newDepartment.name || !newDepartment.acronym) return;
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDepartment),
      });

      if (!response.ok) throw new Error("Failed to add department");

      fetchDepartments();
      setNewDepartment({ name: "", acronym: "" });
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingId(department.id);
    setNewDepartment({ name: department.name, acronym: department.acronym });
  };

  const handleUpdate = async (id: number) => {
    if (!newDepartment.name || !newDepartment.acronym) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDepartment),
      });

      if (!response.ok) throw new Error("Failed to update department");

      fetchDepartments();
      setEditingId(null);
      setNewDepartment({ name: "", acronym: "" });
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete department");

      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Department Records</h1>
      </div>
      <p className="text-muted-foreground">Departments should be created here and then to be used in different sections</p>
      <div className="space-y-4 p-4 rounded-lg border bg-card">
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Enter Department Name"
            value={newDepartment.name}
            onChange={(e) =>
              setNewDepartment({ ...newDepartment, name: e.target.value })
            }
            className="max-w-xs"
          />
          <Input
            placeholder="Enter Department Acronym"
            value={newDepartment.acronym}
            onChange={(e) =>
              setNewDepartment({ ...newDepartment, acronym: e.target.value })
            }
            className="max-w-xs"
          />
          <Button onClick={handleAdd} className="transition-transform hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Acronym</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>
                  {editingId === department.id ? (
                    <Input
                      value={newDepartment.name}
                      onChange={(e) =>
                        setNewDepartment({ ...newDepartment, name: e.target.value })
                      }
                    />
                  ) : (
                    department.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === department.id ? (
                    <Input
                      value={newDepartment.acronym}
                      onChange={(e) =>
                        setNewDepartment({ ...newDepartment, acronym: e.target.value })
                      }
                    />
                  ) : (
                    department.acronym
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    {editingId === department.id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdate(department.id)}
                        className="transition-colors hover:text-blue-600 hover:border-blue-600"
                      >
                        Save
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(department)}
                        className="transition-colors hover:text-blue-600 hover:border-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(department.id)}
                      className="transition-colors hover:text-red-600 hover:border-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {departments.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No departments found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
