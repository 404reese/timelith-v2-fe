// app/divisions/[id]/assign-students/page.tsx
import { Metadata } from 'next';
import AssignStudentsClient from './AssignStudentsClient';

export async function generateStaticParams() {
  try {
    const res = await fetch('http://localhost:8080/divisions');
    if (!res.ok) throw new Error('Failed to fetch divisions');
    const divisions = await res.json();
    
    console.log('Divisions:', divisions); // Add this line to debug

    return divisions.map((division: { id: number }) => ({
      id: division.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}


export const dynamicParams = true; // Allow dynamic params not generated at build

export default async function AssignStudentsPage({ 
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
      throw new Error('Failed to fetch data');
    }

    const division = await divisionRes.json();
    const students = await studentsRes.json();

    return (
      <AssignStudentsClient 
        initialDivision={division}
        initialStudents={students}
        params={params}
      />
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Failed to load data</h2>
        <a href="/divisions" className="text-blue-600 hover:underline">
          Back to divisions
        </a>
      </div>
    );
  }
}