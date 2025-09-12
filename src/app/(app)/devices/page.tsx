'use client';

import { useState, useEffect } from 'react';
import DeviceList from '@/components/devices/device-list';
import type { DashboardData, Device } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

async function getDevices(): Promise<Device[]> {
  try {
    const response = await fetch('/api/dashboard-data', {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch devices, status:', response.status);
      return [];
    }
    const data: DashboardData = await response.json();
    return data.devices || [];
  } catch (error) {
    console.error('API call failed, returning empty array:', error);
    return [];
  }
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const deviceData = await getDevices();
      setDevices(deviceData);
      setLoading(false);
    };

    fetchData();

    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
       {loading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <DeviceList devices={devices} />
      )}
    </main>
  );
}
