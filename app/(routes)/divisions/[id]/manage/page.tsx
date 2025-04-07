// app/divisions/[id]/manage/page.tsx
import { Metadata } from 'next';
import ManageClient from './ManageClient';

interface Division {
  id: number;
  identity: string;
  year: number;
  semester: string;
  department: {
    name: string;
    acronym: string;
  };
  studentIds: number[];
}

interface Student {
  id: number;
  name: string;
  rollNumber: string;
}

export async function generateStaticParams() {
  try {
    const res = await fetch('http://localhost:8080/divisions');
    if (!res.ok) throw new Error('Failed to fetch divisions');
    const divisions: Division[] = await res.json();
    return divisions.map(division => ({ id: division.id.toString() }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export const dynamicParams = true;

export default async function DivisionManagePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    const [divisionRes, studentsRes] = await Promise.all([
      fetch(`http://localhost:8080/divisions/${params.id}`),
      fetch('http://localhost:8080/students')
    ]);

    if (!divisionRes.ok || !studentsRes.ok) {
      throw new Error('Failed to fetch initial data');
    }

    const division: Division = await divisionRes.json();
    const students: Student[] = await studentsRes.json();

    return (
      <ManageClient 
        initialDivision={division}
        initialStudents={students}
        params={params}
      />
    );
  } catch (error) {
    console.error('Error in page component:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Failed to load division data</h2>
        <a href="/divisions" className="text-blue-600 hover:underline">
          Back to divisions list
        </a>
      </div>
    );
  }
}