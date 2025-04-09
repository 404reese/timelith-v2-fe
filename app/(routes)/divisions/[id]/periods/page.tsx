import PeriodsClient from './PeriodsClient';

// Helper function to fetch all division IDs
async function getDivisionIds() {
  try {
    const response = await fetch('http://localhost:8080/divisions', { cache: 'no-store' });
    const divisions = await response.json();
    return divisions.map((division: { id: number }) => ({
      id: division.id.toString(),
    }));
  } catch (error) {
    console.error('Error fetching division IDs:', error);
    return [];
  }
}

export async function generateStaticParams() {
  const divisions = await getDivisionIds();
  return divisions;
}

export default async function DivisionPeriodsPage({
  params,
}: {
  params: { id: string };
}) {
  return <PeriodsClient params={params} />;
}
