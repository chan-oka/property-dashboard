import Link from 'next/link';
import { Property } from '@/lib/api';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold text-gray-900">
          {property.property_name}
        </h3>
        <p className="text-xl font-bold text-blue-600 my-2">
          ¥{property.price.toLocaleString()}
        </p>
        <div className="space-y-1 text-sm text-gray-600">
          <p>{property.address}</p>
          <p>
            {property.station_name}駅 徒歩{property.station_distance}分
          </p>
        </div>
      </div>
    </Link>
  );
};
