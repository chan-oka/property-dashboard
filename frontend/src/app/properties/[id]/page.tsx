// src/app/properties/[id]/page.tsx
import { Suspense } from 'react';
import { PropertyDetail } from '@/components/PropertyDetail';

type Params = Promise<{ id: string }>;

interface PageProps {
  params: Params;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertyDetail propertyId={id} />
    </Suspense>
  );
}
