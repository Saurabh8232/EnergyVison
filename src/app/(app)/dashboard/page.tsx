import { Sun, BatteryCharging, Cloud, CloudRain, Wind, MapPin, Gauge, Zap, Thermometer } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import PowerCharts from '@/components/dashboard/power-charts';
import type { DashboardData } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

async function getDashboardData(): Promise<DashboardData> {
  // In a real app, you would fetch this data from your server.
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9002';

  try {
      const response = await fetch(`${baseUrl}/api/dashboard-data`, {
        next: { revalidate: 60 } // Re-fetch data every 60 seconds
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return await response.json();
    } catch (error) {
      console.error('API call failed, returning static data:', error);
    }
  
  // Returning static data as a fallback.
  return Promise.resolve(staticDashboardData);
}

export default async function DashboardPage() {
  const { 
    solarGenerationData, 
    batteryLoadData,
    solarParametersData,
    acParametersData,
    metrics,
  } = await getDashboardData();


  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Box Temperature"
            value={`${metrics.boxTemperature}°C`}
            icon={Thermometer}
            description="Internal device temperature"
          />
          <StatCard
            title="Wind Speed"
            value={`${metrics.windSpeed} m/s`}
            icon={Wind}
            description="Current wind speed"
          />
          <StatCard
            title="Cloud Coverage"
            value={`${metrics.cloudCoverage}%`}
            icon={Cloud}
            description="Sky cloud coverage"
          />
          <StatCard
            title="Rain"
            value={`${metrics.rain} mm`}
            icon={CloudRain}
            description="Rainfall in the last hour"
          />
          <StatCard
            title="Latitude"
            value={metrics.latitude.toString()}
            icon={MapPin}
            description="System latitude"
          />
          <StatCard
            title="Longitude"
            value={metrics.longitude.toString()}
            icon={MapPin}
            description="System longitude"
          />
          <StatCard
            title="Solar Power"
            value={`${metrics.solarPower} kW`}
            icon={Sun}
            description="+20.1% from last hour"
          />
           <StatCard
            title="Energy"
            value={`${metrics.energy} kWh`}
            icon={Zap}
            description="Total generated today"
          />
        </div>

        <PowerCharts
          solarData={solarGenerationData}
          batteryData={batteryLoadData}
          solarParamsData={solarParametersData}
          acParamsData={acParametersData}
        />
        
      </div>
    </main>
  );
}
