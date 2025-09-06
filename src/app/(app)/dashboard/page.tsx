import { Sun, BatteryCharging, Cloud, CloudRain, Wind, MapPin, Gauge, Zap, Thermometer } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import PowerCharts from '@/components/dashboard/power-charts';
import type { DashboardData } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

async function getDashboardData(): Promise<DashboardData> {
  // This function fetches data from the app's own API route.
  // This ensures there are no CORS issues after deployment.
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9002';

  try {
      // We use a relative path here to ensure the request is always on the same domain.
      const response = await fetch('/api/dashboard-data', {
        next: { revalidate: 1 } // Re-fetch data very frequently.
      });

      if (!response.ok) {
        console.error('Failed to fetch dashboard data, status:', response.status);
        return staticDashboardData; // Fallback to static data on error
      }
      return await response.json();
    } catch (error) {
      console.error('API call failed, returning static data:', error);
      // In case of a network error or if the fetch fails completely.
      return staticDashboardData;
    }
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
