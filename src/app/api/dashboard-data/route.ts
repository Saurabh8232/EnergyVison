
import { NextResponse } from 'next/server';
import { get, ref, update, push, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { DashboardData, Alert, TimeSeriesData, PredictionData, Device, DashboardMetrics } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';
import { z } from 'zod';

export const maxDuration = 25;

const dbRef = ref(database, 'dashboardData');

// Define a schema for the incoming data to ensure it has the metrics object.
// .passthrough() allows other properties to be included without failing validation.
const IncomingDataSchema = z.object({
  metrics: z.record(z.any()).optional(), // Keep it flexible for now, just ensure metrics can be an object
}).passthrough();


export async function GET() {
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.val());
    } else {
      // If no data, return the static data as a starting point
      await set(dbRef, staticDashboardData);
      return NextResponse.json(staticDashboardData);
    }
  } catch (error) {
    console.error('Firebase read failed:', error);
    // Fallback to static data in case of error
    return NextResponse.json(staticDashboardData, { status: 500 });
  }
}

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const rawData = await request.json();
    console.log("Received data from external server:", rawData);

    // Validate the incoming data against our schema
    const validation = IncomingDataSchema.safeParse(rawData);
    if (!validation.success) {
        console.error("Invalid data format received:", validation.error);
        return NextResponse.json({ message: 'Invalid data format. "metrics" object is required.' }, { status: 400, headers });
    }
    
    const newData = validation.data;

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
    return NextResponse.json({ message: 'Error processing data' }, { status: 500, headers });
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
