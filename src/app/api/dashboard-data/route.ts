import { NextResponse } from 'next/server';
import type { DashboardData, Alert, PredictionData, Device } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

// Use a simple in-memory variable to store the latest dashboard data.
// In a real production app, you would use a database like Firestore or Redis.
let latestDashboardData: DashboardData = JSON.parse(JSON.stringify(staticDashboardData));

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

// This function will now be called from the POST request to process incoming data
// and decide if an alert needs to be generated.
const processIncomingData = (newData: Partial<DashboardData>) => {
    // Merge the new data with the existing data
    const updatedData = { ...latestDashboardData, ...newData };

    // Example logic for triggering an alert.
    // In a real app, you'd have more sophisticated rules here based on the `newData`.
    // For simulation, we'll still use a random chance, but this is where your
    // specific alert logic would go. For example:
    // if (newData.metrics && newData.metrics.batteryPercentage < 20) { ... }

    if (Math.random() < 0.2) { // ~20% chance to add an alert on new data
        const randomAlert = alertPool[Math.floor(Math.random() * alertPool.length)];
        const newAlert: Alert = {
            ...randomAlert,
            id: `alert-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
        };
        updatedData.alerts.push(newAlert);

        // Keep the total number of alerts from growing indefinitely.
        if (updatedData.alerts.length > 20) {
            updatedData.alerts.shift();
        }
    }

    // Update the global state
    latestDashboardData = updatedData;
};

export async function GET() {
  // This endpoint is called by the frontend to get the most recent data.
  // It now returns the latest data that was POSTed by the external server.
  try {
    return NextResponse.json(latestDashboardData);
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

    // Process the new data, update the `latestDashboardData`, and generate alerts if needed.
    processIncomingData(newData);
    
    return NextResponse.json({ message: 'Data received successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing incoming data:', error);
    return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
  }
}
