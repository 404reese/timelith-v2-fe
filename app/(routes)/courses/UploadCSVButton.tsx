"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import Papa from "papaparse";

interface UploadCSVButtonProps {
  onSuccess: () => void;
  departments: { id: number; name: string }[];
  periodTypes: { id: number; type: string }[];
}

export function UploadCSVButton({ onSuccess, departments, periodTypes }: UploadCSVButtonProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileUpload = async () => {
    if (!file) return;

    setLoading(true);
    setErrors([]);
    
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const validCourses = [];
        const newErrors = [];
        
        // Validate CSV data
        for (const [index, row] of results.data.entries()) {
          try {
            if (!row.courseCode || !row.courseName || !row.courseInit || !row.semester || !row.departmentId || !row.type) {
              throw new Error("Missing required fields");
            }

            const department = departments.find(d => d.id === Number(row.departmentId));
            if (!department) {
              throw new Error("Invalid department ID");
            }

            const periodType = periodTypes.find(pt => pt.type === row.type);
            if (!periodType) {
              throw new Error("Invalid course type");
            }

            if (isNaN(Number(row.semester)) || Number(row.semester) < 1 || Number(row.semester) > 8) {
              throw new Error("Invalid semester (1-8)");
            }

            validCourses.push({
              courseCode: row.courseCode,
              courseName: row.courseName,
              courseInit: row.courseInit,
              semester: row.semester,
              departmentId: Number(row.departmentId),
              type: row.type
            });
          } catch (error) {
            newErrors.push(`Row ${index + 1}: ${(error as Error).message}`);
          }
        }

        if (newErrors.length > 0) {
          setErrors(newErrors);
          setLoading(false);
          return;
        }

        // Upload in chunks
        const chunkSize = 10;
        for (let i = 0; i < validCourses.length; i += chunkSize) {
          const chunk = validCourses.slice(i, i + chunkSize);
          const responses = await Promise.all(
            chunk.map(course => 
              fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/courses/${course.departmentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course)
              })
            )
          );
          
          setProgress(Math.round(((i + chunkSize) / validCourses.length) * 100));
        }

        setOpen(false);
        onSuccess();
        setLoading(false);
      },
      error: (error: Error) => {
        setErrors([`CSV parsing error: ${error.message}`]);
        setLoading(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-4">
          Bulk Upload
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload CSV File</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input 
            type="file" 
            accept=".csv" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {progress > 0 && <Progress value={progress} className="h-2" />}

          {errors.length > 0 && (
            <div className="text-red-500 text-sm">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}

          <Button 
            onClick={handleFileUpload}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}