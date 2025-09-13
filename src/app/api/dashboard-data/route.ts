
import { NextResponse } from 'next/server';
import { get, ref, update, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { DashboardData, Alert, TimeSeriesData, PredictionData, Device } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

export const maxDuration = 25;

const dbRef = ref(database, 'dashboardData');

// Helper function to generate random data
const generateRandomData = (): DashboardData => {
  const now = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getTime() - (11 - i) * 2 * 60 * 60 * 1000);
    return `${d.getHours().toString().padStart(2, '0')}:00`;
  });

  const randomFloat = (min: number, max: number, decimals: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  };

  const solarGenerationData = hours.map(time => ({
    time,
    power: time.substring(0, 2) >= '06' && time.substring(0, 2) <= '20' ? randomFloat(0, 4.5) : 0,
  }));

  const batteryLoadData = hours.map(time => ({
    time,
    battery: randomFloat(40, 95),
    load: randomFloat(1.0, 3.0),
  }));

  const solarParametersData = hours.map(time => ({
      time,
      voltage: time.substring(0, 2) >= '06' && time.substring(0, 2) <= '20' ? randomFloat(350, 410) : 0,
      current: time.substring(0, 2) >= '06' && time.substring(0, 2) <= '20' ? randomFloat(1, 11) : 0,
  }));

  const acParametersData = hours.map(time => ({
      time,
      voltage: randomFloat(220, 240),
      current: randomFloat(5, 11),
  }));

  const predictionData = staticDashboardData.predictionData.map((d, i) => ({
    ...d,
    actual: d.actual ? randomFloat(2.0, 4.5) : undefined,
    predicted: randomFloat(2.0, 4.5),
  }));

  return {
    solarGenerationData,
    batteryLoadData,
    solarParametersData,
    acParametersData,
    predictionData,
    alerts: staticDashboardData.alerts.map(a => ({...a, timestamp: new Date().toISOString()})).sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * staticDashboardData.alerts.length)),
    devices: staticDashboardData.devices,
    metrics: {
      windSpeed: randomFloat(0, 15),
      cloudCoverage: randomFloat(0, 100),
      rain: randomFloat(0, 5),
      latitude: 34.0522,
      longitude: -118.2437,
      solarPower: randomFloat(0, 5),
      energyGeneration: randomFloat(10, 25),
      energyConsumption: randomFloat(3, 8),
      inverterVoltage: randomFloat(220, 240),
      inverterCurrent: randomFloat(5, 11),
      batteryPercentage: randomFloat(40, 95),
      powerFactor: randomFloat(0.95, 1.0),
    }
  };
};

export async function GET() {
    return NextResponse.json(generateRandomData());
}

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const newData = await request.json();
    console.log("Received data from external server:", newData);

    // Efficiently update only the specified fields in Firebase
    await update(dbRef, newData);

    // Handle alerts separately using push to avoid race conditions
    const alertPool: Omit<Alert, 'id' | 'timestamp'>[] = [
        { level: 'critical', message: 'Overload: System load exceeds capacity.' },
        { level: 'warning', message: 'High Load Warning: System load is approaching maximum capacity.' },
        { level: 'info', message: 'Load Normal: System load has returned to normal levels.' },
        { level: 'critical', message: 'Solar generating but battery not charging. Check connections.' },
        { level: 'warning', message: 'Strong sunlight but panel underperforming.' },
        { level: 'info', message: 'Sudden drop in sunlight detected. Potential cloud cover.' },
        { level: 'critical', message: 'Battery critically low – Discharge risk.' },
    ];
    
    // ~20% chance to add an alert on new data
    if (Math.random() < 0.2) { 
        const randomAlert = alertPool[Math.floor(Math.random() * alertPool.length)];
        const newAlert: Alert = {
            ...randomAlert,
            id: `alert-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
        };
        const alertsRef = ref(database, 'dashboardData/alerts');
        await push(alertsRef, newAlert);
    }

    return NextResponse.json({ message: 'Data received successfully' }, { status: 200, headers });
  } catch (error) {
    console.error('Error processing incoming data:', error);
    return NextResponse.json({ message: 'Invalid data format' }, { status: 400, headers });
  }
}

export function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return new Response(null, { status: 204, headers });
}
