import DeviceList from '@/components/devices/device-list';
import type { DashboardData, Device } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';
import { headers } from 'next/headers';

async function getDevices(): Promise<Device[]> {
  try {
    const host = headers().get('host') || 'localhost:9002';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const url = `${protocol}://${host}/api/dashboard-data`;

    const response = await fetch(url, {
      next: { revalidate: 1 } // Re-fetch data very frequently.
    });

    if (!response.ok) {
      console.error('Failed to fetch devices, status:', response.status);
      return staticDashboardData.devices; // Fallback to static data
    }
    const data: DashboardData = await response.json();
    return data.devices;
  } catch (error) {
    console.error('API call failed, returning static data:', error);
    return staticDashboardData.devices;
  }
}

export default async function DevicesPage() {
  const devices = await getDevices();
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <DeviceList devices={devices} />
    </main>
  );
}
