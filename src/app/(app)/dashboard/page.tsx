import { BatteryCharging, Sun, Zap, Network } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import PowerCharts from '@/components/dashboard/power-charts';
import BatteryOptimizer from '@/components/dashboard/battery-optimizer';
import type { Device, TimeSeriesData } from '@/lib/types';
import { devices, solarGenerationData, batteryLoadData } from '@/lib/data';

async function getDashboardData(): Promise<{
  solarGenerationData: TimeSeriesData[],
  batteryLoadData: TimeSeriesData[],
  devices: Device[]
}> {
  // In a real app, you would fetch this data from your server using a relative path.
  // We will return static data for now as a placeholder.
  // When you build your API, you can replace this with:
  /*
  try {
    const response = await fetch('/api/dashboard-data', {
      next: { revalidate: 60 } // Re-fetch data every 60 seconds
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    return response.json();
  } catch (error) {
    console.error('API call failed, returning static data:', error);
  }
  */
  
  // Returning static data as a fallback.
  return Promise.resolve({
    solarGenerationData,
    batteryLoadData,
    devices
  });
}

export default async function DashboardPage() {
  // In a real app, you would fetch this data from your server.
  // We'll use placeholder data for now.
  const { solarGenerationData: fetchedSolarData, batteryLoadData: fetchedBatteryData, devices: fetchedDevices } = await getDashboardData();


  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Solar Power Generation"
            value="4.2 kW"
            icon={Sun}
            description="+20.1% from last hour"
          />
          <StatCard
            title="Battery Level"
            value="85%"
            icon={BatteryCharging}
            description="Optimal charge level"
          />
          <StatCard
            title="Load Consumption"
            value="1.8 kW"
            icon={Zap}
            description="Normal consumption"
          />
          <StatCard
            title="Grid Status"
            value="Connected"
            icon={Network}
            description="Grid power is active"
          />
        </div>

        <PowerCharts
          solarData={fetchedSolarData}
          batteryData={fetchedBatteryData}
        />
        
        <BatteryOptimizer
          devices={fetchedDevices.filter(d => d.type === 'Battery')}
        />
      </div>
    </main>
  );
}
