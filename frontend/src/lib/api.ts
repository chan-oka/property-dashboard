import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Property {
  id: string;
  property_name: string;
  price: number;
  address: string;
  station_name: string;
  station_distance: number;
  created_at: string;
  updated_at: string;
}

export const fetchProperties = async (page = 1, pageSize = 10) => {
  const response = await api.get<{ properties: Property[] }>(
    '/api/properties',
    {
      params: { page, pageSize },
    }
  );
  return response.data;
};

export const fetchProperty = async (id: string) => {
  const response = await api.get<Property>(`/api/properties/${id}`);
  return response.data;
};
