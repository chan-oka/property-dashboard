import { PropertyCard } from './PropertyCard';
import { Property } from '@/lib/api';

interface PropertyListProps {
  properties: Property[];
}

export const PropertyList = ({ properties }: PropertyListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
