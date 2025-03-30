"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

interface Department {
  id: number;
  name: string;
  acronym: string;
}

interface DepartmentSelectProps {
  value: string;
  onValueChange: (value: string, department: Department) => void;
  placeholder?: string;
}

export default function DepartmentSelect({
  value,
  onValueChange,
  placeholder = "Select Department",
}: DepartmentSelectProps) {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/departments`)
      .then((res) => res.json())
      .then((data) => {
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      });
  }, []);

  return (
    <Select
      value={value}
      onValueChange={(value) => {
        const selectedDept = departments.find((d) => d.id === Number(value));
        onValueChange(value, selectedDept || { id: Number(value), name: "", acronym: "" });
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={String(dept.id)}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
