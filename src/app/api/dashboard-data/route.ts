
import { NextResponse } from 'next/server';
import { get, ref, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { DashboardData } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

const dbRef = ref(database, 'dashboardData');

async function initializeData() {
    const snapshot = await get(dbRef);
    if (!snapshot.exists()) {
        await set(dbRef, staticDashboardData);
    }
}

initializeData();

export async function GET() {
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.val());
    } else {
      // If no data, initialize and return static data
      await set(dbRef, staticDashboardData);
      return NextResponse.json(staticDashboardData);
    }
  } catch (error) {
    console.error('Error fetching data from Firebase:', error);
    return NextResponse.json({ message: 'Error fetching data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    console.log("Received data from external server:", newData);

    // Get current data from Firebase
    const snapshot = await get(dbRef);
    const currentData = snapshot.exists() ? snapshot.val() : staticDashboardData;

    // A pool of potential alerts to be triggered by incoming data.
    const alertPool: Omit<import('@/lib/types').Alert, 'id' | 'timestamp'>[] = [
        { level: 'critical', message: 'Overload: System load exceeds capacity.' },
        { level: 'warning', message: 'High Load Warning: System load is approaching maximum capacity.' },
        { level: 'info', message: 'Load Normal: System load has returned to normal levels.' },
        { level: 'critical', message: 'Solar generating but battery not charging. Check connections.' },
        { level: 'warning', message: 'Strong sunlight but panel underperforming.' },
        { level: 'info', message: 'Sudden drop in sunlight detected. Potential cloud cover.' },
        { level: 'critical', message: 'Battery critically low – Discharge risk.' },
    ];

    if (Math.random() < 0.2) { // ~20% chance to add an alert on new data
        const randomAlert = alertPool[Math.floor(Math.random() * alertPool.length)];
        const newAlert: import('@/lib/types').Alert = {
            ...randomAlert,
            id: `alert-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
        };
        if (!currentData.alerts) {
            currentData.alerts = [];
        }
        currentData.alerts.unshift(newAlert);
        if (currentData.alerts.length > 20) {
            currentData.alerts.pop();
        }
    }

    // Merge new data with current data
    const updatedData: DashboardData = {
        ...currentData,
        ...newData,
        metrics: { ...currentData.metrics, ...newData.metrics },
        // Keep arrays from static data if not provided in newData
        solarGenerationData: newData.solarGenerationData || currentData.solarGenerationData,
        batteryLoadData: newData.batteryLoadData || currentData.batteryLoadData,
        solarParametersData: newData.solarParametersData || currentData.solarParametersData,
        acParametersData: newData.acParametersData || currentData.acParametersData,
        predictionData: newData.predictionData || currentData.predictionData,
        devices: newData.devices || currentData.devices,
        alerts: currentData.alerts,
    };

    await set(dbRef, updatedData);
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-control-allow-headers': 'Content-Type',
    };

    return NextResponse.json({ message: 'Data received successfully' }, { status: 200, headers });
  } catch (error) {
    console.error('Error processing incoming data:', error);
    return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
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
