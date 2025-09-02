import { BatteryCharging, Sun, Zap, Network } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import PowerCharts from '@/components/dashboard/power-charts';
import BatteryOptimizer from '@/components/dashboard/battery-optimizer';
import type { Device, TimeSeriesData } from '@/lib/types';

async function getDashboardData() {
  // TODO: Replace with your actual API endpoint
  const response = await fetch('https://example.com/api/dashboard-data', {
    next: { revalidate: 60 } // Re-fetch data every 60 seconds
  });
  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
}

export default async function DashboardPage() {
  // In a real app, you would fetch this data from your server.
  // We'll use placeholder data for now.
  const solarGenerationData: TimeSeriesData[] = [
    { time: '00:00', power: 0 }, { time: '02:00', power: 0 }, { time: '04:00', power: 0 },
    { time: '06:00', power: 0.5 }, { time: '08:00', power: 2.1 }, { time: '10:00', power: 3.5 },
    { time: '12:00', power: 4.2 }, { time: '14:00', power: 3.8 }, { time: '16:00', power: 2.5 },
    { time: '18:00', power: 0.8 }, { time: '20:00', power: 0 }, { time: '22:00', power: 0 },
  ];
  
  const batteryLoadData: TimeSeriesData[] = [
    { time: '00:00', battery: 60, load: 1.2 }, { time: '02:00', battery: 55, load: 1.1 },
    { time: '04:00', battery: 50, load: 1.0 }, { time: '06:00', battery: 52, load: 1.5 },
    { time: '08:00', battery: 60, load: 2.0 }, { time: '10:00', battery: 75, load: 1.8 },
    { time: '12:00', battery: 85, load: 1.7 }, { time: '14:00', battery: 90, load: 1.9 },
    { time: '16:00', battery: 88, load: 2.2 }, { time: '18:00', battery: 82, load: 2.5 },
    { time: '20:00', battery: 75, load: 2.1 }, { time: '22:00', battery: 68, load: 1.5 },
  ];

  const devices: Device[] = [
    { id: 'device-01', name: 'Main Power Unit', status: 'Connected', type: 'Battery' },
    { id: 'device-02', name: 'Solar Panel Array 1', status: 'Connected', type: 'Solar' },
    { id: 'device-03', name: 'Backup Generator', status: 'Disconnected', type: 'Generator' },
  ];


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
          solarData={solarGenerationData}
          batteryData={batteryLoadData}
        />
        
        <BatteryOptimizer
          devices={devices.filter(d => d.type === 'Battery')}
        />
      </div>
    </main>
  );
}
