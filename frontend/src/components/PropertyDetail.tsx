'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { fetchProperty, Property } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface PropertyDetailProps {
  propertyId: string;
}

export function PropertyDetail({ propertyId }: PropertyDetailProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await fetchProperty(propertyId);
        setProperty(data);
      } catch (error) {
        console.error('Failed to fetch property:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="secondary"
          onClick={() => router.push('/properties')}
          className="mb-4"
        >
          ← 一覧に戻る
        </Button>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">{property.property_name}</h1>

          <div className="space-y-4">
            <div className="text-3xl font-bold text-blue-600">
              ¥{property.price.toLocaleString()}
            </div>

            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">住所:</span> {property.address}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">最寄り駅:</span>{' '}
                {property.station_name}駅 （徒歩{property.station_distance}分）
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">更新日:</span>{' '}
                {new Date(property.updated_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
