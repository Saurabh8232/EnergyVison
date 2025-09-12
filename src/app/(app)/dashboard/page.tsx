"use client";

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, MapPin, Zap, Battery, Power, Bolt } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import PowerCharts from '@/components/dashboard/power-charts';
import type { DashboardData } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

async function getDashboardData(): Promise<DashboardData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

  try {
    const response = await fetch('/api/dashboard-data', {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Failed to fetch dashboard data, status:', response.status);
      return staticDashboardData;
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('API call timed out, returning static data.');
    } else {
      console.error('API call failed, returning static data:', error);
    }
    return staticDashboardData;
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    };

    fetchData();

    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-[126px] w-full" />
            ))}
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </main>
    );
  }

  const { 
    solarGenerationData, 
    batteryLoadData,
    solarParametersData,
    acParametersData,
    metrics,
  } = data;

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Battery"
            value={`${metrics.batteryPercentage}%`}
            icon={Battery}
            description="Current battery charge level"
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
            value={`${metrics.energyGeneration} kWh`}
            icon={Zap}
            description={`Total Energy Generation Today`}
            footerText={`${metrics.energyConsumption} kWh Consumed`}
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
