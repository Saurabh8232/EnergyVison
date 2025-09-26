'use client';

import { useState, useEffect } from 'react';
import DeviceList from '@/components/devices/device-list';
import type { DashboardData, Device } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { staticDashboardData } from '@/lib/data';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource('/api/dashboard-data');

    eventSource.onmessage = (event) => {
      try {
        const dashboardData: DashboardData = JSON.parse(event.data);
        if (dashboardData && dashboardData.devices) {
          setDevices(dashboardData.devices);
        } else {
          setDevices(staticDashboardData.devices);
        }
      } catch (error) {
        console.error('Failed to parse dashboard data:', error);
        setDevices(staticDashboardData.devices);
      } finally {
        setLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setDevices(staticDashboardData.devices);
      setLoading(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
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
