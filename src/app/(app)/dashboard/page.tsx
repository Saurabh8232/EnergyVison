import { BatteryCharging, Sun, Zap, Network } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import PowerCharts from '@/components/dashboard/power-charts';
import BatteryOptimizer from '@/components/dashboard/battery-optimizer';
import {
  solarGenerationData,
  batteryLoadData,
  devices,
  historicalBatteryDataForDevice,
} from '@/lib/data';

export default function DashboardPage() {
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
          devices={devices}
          historicalData={historicalBatteryDataForDevice}
        />
      </div>
    </main>
  );
}
