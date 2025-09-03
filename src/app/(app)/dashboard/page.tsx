import { BatteryCharging, Sun, Zap, Network } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import PowerCharts from '@/components/dashboard/power-charts';
import type { TimeSeriesData } from '@/lib/types';
import { solarGenerationData, batteryLoadData } from '@/lib/data';

async function getDashboardData(): Promise<{
  solarGenerationData: TimeSeriesData[],
  batteryLoadData: TimeSeriesData[]
}> {
  // In a real app, you would fetch this data from your server using a relative path.
  // We will return static data for now as a placeholder.
  /*
  try {
    const response = await fetch('/api/dashboard-data', {
      next: { revalidate: 60 } // Re-fetch data every 60 seconds
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    const data = await response.json();
    return {
        solarGenerationData: data.solarGenerationData,
        batteryLoadData: data.batteryLoadData
    }
  } catch (error) {
    console.error('API call failed, returning static data:', error);
  }
  */
  
  // Returning static data as a fallback.
  return Promise.resolve({
    solarGenerationData,
    batteryLoadData
  });
}

export default async function DashboardPage() {
  const { solarGenerationData: fetchedSolarData, batteryLoadData: fetchedBatteryData } = await getDashboardData();


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
        
      </div>
    </main>
  );
}
