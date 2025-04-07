// app/divisions/[divisionId]/autocreate/page.tsx
import { fetchStudents, fetchCourses } from '@/app/api/divisions/route';
import CreateForm from './CreateForm';

export async function generateStaticParams() {
  // Fetch or define possible division IDs at build time
  // Replace this with your actual data source
  return [
    { divisionId: '201' },
    { divisionId: '202' },
    // Add other division IDs...
  ];
}

export default async function AutoCreatePage({
  params,
}: {
  params: { divisionId: string };
}) {
  // Server-side data fetching
  const [students, courses] = await Promise.all([
    fetchStudents(params.divisionId),
    fetchCourses(params.divisionId),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Create Periods for Division {params.divisionId}</h1>
      <CreateForm 
        divisionId={params.divisionId}
        initialStudents={students}
        initialCourses={courses}
      />
    </div>
  );
}