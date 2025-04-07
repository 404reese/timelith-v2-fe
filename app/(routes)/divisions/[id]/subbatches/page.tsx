// app/(routes)/divisions/[id]/subbatches/page.tsx

import SubBatchManagementClient from ".//SubBatchManagementClient";

interface Division {
  id: number;
  department: {
    name: string;
    acronym: string;
  };
  identity: string;
}

interface SubBatch {
  id?: number;
  subBatchName: string;
  divisionId: number;
  studentIds: number[];
}

export async function generateStaticParams() {
  try {
    const res = await fetch('http://localhost:8080/divisions');
    const divisions: Division[] = await res.json();
    return divisions.map((division) => ({
      id: division.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const divisionId = params.id;

  // Fetch division and sub-batches on the server
  const [divisionRes, subBatchesRes] = await Promise.all([
    fetch(`http://localhost:8080/divisions/${divisionId}`),
    fetch(`http://localhost:8080/divisions/${divisionId}/subbatches`),
  ]);

  if (!divisionRes.ok || !subBatchesRes.ok) {
    throw new Error("Failed to fetch division or sub-batches");
  }

  const division: Division = await divisionRes.json();
  const subBatches: SubBatch[] = await subBatchesRes.json();

  return (
    <SubBatchManagementClient
      initialDivision={division}
      initialSubBatches={subBatches}
    />
  );
}