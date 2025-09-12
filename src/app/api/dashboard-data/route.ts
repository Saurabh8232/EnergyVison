
import { NextResponse } from 'next/server';
import { get, ref, set, update, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { DashboardData, Alert } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

const dbRef = ref(database, 'dashboardData');

export async function GET() {
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.val());
    } else {
      // If no data, return static data as a fallback.
      // The POST handler will create the initial entry.
      return NextResponse.json(staticDashboardData);
    }
  } catch (error) {
    console.error('Error fetching data from Firebase:', error);
    // If there's an error, return static data to prevent the app from crashing.
    return NextResponse.json(staticDashboardData);
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    console.log("Received data from external server:", newData);

    // Use update() for a more efficient, partial update.
    await update(dbRef, newData);

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
    
    // ~20% chance to add an alert on new data
    if (Math.random() < 0.2) { 
        const randomAlert = alertPool[Math.floor(Math.random() * alertPool.length)];
        const newAlert: Alert = {
            ...randomAlert,
            id: `alert-${Date.now()}-${Math.random()}`, // The ID is mostly for React keys
            timestamp: new Date().toISOString(),
        };

        // Use push() to add a new alert without overwriting others.
        const alertsRef = ref(database, 'dashboardData/alerts');
        await push(alertsRef, newAlert);
    }
    
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
