'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { fetchProperties, Property } from '@/lib/api';
import { PropertyList } from '@/components/PropertyList';
import { Button } from '@/components/ui/Button';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
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
    const loadProperties = async () => {
      try {
        const data = await fetchProperties();
        setProperties(data.properties);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">物件一覧</h1>
        <Button onClick={handleLogout} variant="secondary">
          ログアウト
        </Button>
      </div>
      <PropertyList properties={properties} />
    </div>
  );
}
