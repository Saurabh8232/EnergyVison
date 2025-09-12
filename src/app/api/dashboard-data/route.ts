import { NextResponse } from 'next/server';
import type { DashboardData, Alert, PredictionData, Device } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

// A pool of potential alerts to be triggered by incoming data.
const alertPool: Omit<Alert, 'id' | 'timestamp'>[] = [
    { level: 'critical', message: 'Overload: System load exceeds capacity.' },
    { level: 'warning', message: 'High Load Warning: System load is approaching maximum capacity.' },
    { level: 'info', message: 'Load Normal: System load has returned to normal levels.' },
    { level: 'critical', message: 'Solar generating but battery not charging. Check connections.' },
    { level: 'warning', message: 'Strong sunlight but panel underperforming.' },
    { level: 'info', message: 'Sudden drop in sunlight detected. Potential cloud cover.' },
    { level: 'critical', message: 'Battery critically low – Discharge risk.' },
];

class DataStore {
  private static instance: DataStore;
  private data: DashboardData;

  private constructor() {
    // Initialize with a deep copy of the static data
    this.data = JSON.parse(JSON.stringify(staticDashboardData));
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  public getData(): DashboardData {
    return this.data;
  }

  public updateData(newData: Partial<DashboardData>) {
    // Merge the new data with the existing data
    const updatedData = { ...this.data, ...newData, metrics: {...this.data.metrics, ...newData.metrics} };

    // Example logic for triggering an alert.
    if (Math.random() < 0.2) { // ~20% chance to add an alert on new data
        const randomAlert = alertPool[Math.floor(Math.random() * alertPool.length)];
        const newAlert: Alert = {
            ...randomAlert,
            id: `alert-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
        };
        // Add to the beginning of the array to show newest first
        updatedData.alerts.unshift(newAlert);

        // Keep the total number of alerts from growing indefinitely.
        if (updatedData.alerts.length > 20) {
            updatedData.alerts.pop();
        }
    }

    // Update the store's data
    this.data = updatedData;
  }
}

const dataStore = DataStore.getInstance();

export async function GET() {
  // This endpoint is called by the frontend to get the most recent data.
  // It now returns the latest data that was POSTed by the external server.
  try {
    return NextResponse.json(dataStore.getData());
  } catch (error) {
    console.error('Error serving dashboard data:', error);
    // If there's an error, fall back to the initial static data.
    return NextResponse.json(staticDashboardData, { status: 500 });
  }
}

export async function POST(request: Request) {
  // This endpoint is called by your ESP32 or external server to send new sensor data.
  try {
    const newData = await request.json();
    console.log("Received data from external server:", newData);

    // Filter the newData object to only include keys that are defined in the DashboardData type
    const allowedKeys: (keyof DashboardData)[] = [
      'solarGenerationData',
      'batteryLoadData',
      'solarParametersData',
      'acParametersData',
      'predictionData',
      'alerts',
      'devices',
      'metrics',
    ];

    const filteredData: Partial<DashboardData> = {};
    for (const key of allowedKeys) {
      if (newData.hasOwnProperty(key)) {
        (filteredData as any)[key] = newData[key];
      }
    }
    
    // If metrics are present, filter them as well
    if (newData.metrics) {
      const allowedMetricsKeys: (keyof import('@/lib/types').DashboardMetrics)[] = [
        'windSpeed',
        'cloudCoverage',
        'rain',
        'latitude',
        'longitude',
        'solarPower',
        'energyGeneration',
        'energyConsumption',
        'inverterVoltage',
        'inverterCurrent',
        'batteryPercentage',
        'powerFactor',
      ];
      
      const filteredMetrics: Partial<import('@/lib/types').DashboardMetrics> = {};
      for (const key of allowedMetricsKeys) {
        if (newData.metrics.hasOwnProperty(key)) {
          (filteredMetrics as any)[key] = newData.metrics[key];
        }
      }
      filteredData.metrics = { ...dataStore.getData().metrics, ...filteredMetrics };
    }

    // Process the new data, update the `latestDashboardData`, and generate alerts if needed.
    dataStore.updateData(filteredData);
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return NextResponse.json({ message: 'Data received successfully' }, { status: 200, headers });
  } catch (error) {
    console.error('Error processing incoming data:', error);
    return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
  }
}
