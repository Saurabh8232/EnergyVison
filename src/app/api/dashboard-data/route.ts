
import { NextResponse } from 'next/server';
import { get, ref, update, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { DashboardData, Alert, TimeSeriesData, PredictionData, Device } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

export const maxDuration = 25;

const dbRef = ref(database, 'dashboardData');

// Helper function to generate random data
const generateRandomData = (): DashboardData => {
  const now = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => `${(i * 2).toString().padStart(2, '0')}:00`);

  const solarGenerationData: TimeSeriesData[] = hours.map(time => {
    const hour = parseInt(time.split(':')[0]);
    let power = 0;
    if (hour > 5 && hour < 20) {
      power = Math.max(0, (Math.sin((hour - 6) * Math.PI / 14) * 4.5) + (Math.random() - 0.5));
    }
    return { time, power: parseFloat(power.toFixed(2)) };
  });

  const batteryLoadData: TimeSeriesData[] = hours.map(time => ({
    time,
    battery: parseFloat((Math.random() * 40 + 60).toFixed(2)),
    load: parseFloat((Math.random() * 1.5 + 1).toFixed(2)),
  }));
  
  const solarParametersData: TimeSeriesData[] = hours.map(time => {
      const hour = parseInt(time.split(':')[0]);
      let voltage = 0;
      let current = 0;
      if (hour > 5 && hour < 20) {
          voltage = Math.random() * 50 + 350;
          current = Math.random() * 10;
      }
      return { time, voltage: parseFloat(voltage.toFixed(2)), current: parseFloat(current.toFixed(2)) };
  });

  const acParametersData: TimeSeriesData[] = hours.map(time => ({
      time,
      voltage: parseFloat((Math.random() * 15 + 220).toFixed(2)),
      current: parseFloat((Math.random() * 5 + 5).toFixed(2)),
  }));

  const predictionData: PredictionData[] = Array.from({length: 7}, (_, i) => {
    const predHour = now.getHours() + i + 1;
    const time = `${predHour % 24}:00`;
    const actualPower = solarGenerationData.find(d => d.time.startsWith(predHour.toString().padStart(2, '0')))?.power;
    const predicted = Math.max(0, (actualPower ?? (Math.random() * 4)) * (0.8 + Math.random() * 0.4));
    
    const data: PredictionData = { time, predicted: parseFloat(predicted.toFixed(2)) };
    if (actualPower !== undefined) {
      data.actual = actualPower;
    }
    return data;
  });

  const devices: Device[] = [
    { id: 'esp32-main', name: 'ESP32 Main', status: 'Connected', type: 'Microcontroller'},
    { id: 'esp32-essential', name: 'Essential ESP32', status: Math.random() > 0.1 ? 'Connected' : 'Disconnected', type: 'Microcontroller'},
    { id: 'esp32-non-essential', name: 'Non-Essential ESP32', status: Math.random() > 0.5 ? 'Connected' : 'Disconnected', type: 'Microcontroller'}
  ];
  
  const alertPool: Omit<Alert, 'id' | 'timestamp'>[] = [
      { level: 'critical', message: 'Overload: System load exceeds capacity.' },
      { level: 'warning', message: 'High Load Warning: System load is approaching maximum capacity.' },
      { level: 'info', message: 'Load Normal: System load has returned to normal levels.' },
      { level: 'critical', message: 'Solar generating but battery not charging. Check connections.' },
      { level: 'warning', message: 'Strong sunlight but panel underperforming.' },
      { level: 'info', message: 'Sudden drop in sunlight detected. Potential cloud cover.' },
      { level: 'critical', message: 'Battery critically low – Discharge risk.' },
  ];

  const alerts: Alert[] = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => {
    const randomAlert = alertPool[Math.floor(Math.random() * alertPool.length)];
    return {
      ...randomAlert,
      id: `alert-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 60000 * Math.random() * 30).toISOString(),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


  return {
    solarGenerationData,
    batteryLoadData,
    solarParametersData,
    acParametersData,
    predictionData,
    alerts,
    devices,
    metrics: {
      windSpeed: parseFloat((Math.random() * 10).toFixed(2)),
      cloudCoverage: parseFloat((Math.random() * 100).toFixed(2)),
      rain: parseFloat((Math.random() * 2).toFixed(2)),
      latitude: 34.0522,
      longitude: -118.2437,
      solarPower: parseFloat(solarGenerationData.find(d => parseInt(d.time.split(':')[0]) >= now.getHours())?.power?.toString() ?? '0'),
      energyGeneration: parseFloat((Math.random() * 10 + 10).toFixed(2)),
      energyConsumption: parseFloat((Math.random() * 5 + 3).toFixed(2)),
      inverterVoltage: parseFloat((Math.random() * 10 + 225).toFixed(2)),
      inverterCurrent: parseFloat((Math.random() * 3 + 7).toFixed(2)),
      batteryPercentage: parseFloat((Math.random() * 20 + 75).toFixed(2)),
      powerFactor: parseFloat((0.95 + Math.random() * 0.04).toFixed(2)),
    }
  };
};

export async function GET() {
  try {
    const randomData = generateRandomData();
    return NextResponse.json(randomData);
  } catch (error) {
    console.error('Error generating random data:', error);
    // Fallback to static data in case of an error
    return NextResponse.json(staticDashboardData, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return NextResponse.json({ message: 'Data received successfully' }, { status: 200, headers });
  } catch (error) {
    console.error('Error processing incoming data:', error);
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
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
