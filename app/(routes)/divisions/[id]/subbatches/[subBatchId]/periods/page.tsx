import SubBatchPeriodsClient from './SubBatchPeriodsClient';

interface SubBatchPeriodsPageProps {
  params: {
    id: string; // Division ID
    subBatchId: string; // Sub-batch ID
  };
}

export default function SubBatchPeriodsPage({ params }: SubBatchPeriodsPageProps) {
  // We pass the params down to the client component, which will handle fetching
  return <SubBatchPeriodsClient params={params} />;
}
