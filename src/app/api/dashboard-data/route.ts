import { NextResponse } from 'next/server';
import type { DashboardData } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

// Use a simple in-memory variable to store the latest dashboard data.
// In a real production app, you would use a database like Firestore or Redis.
let latestDashboardData: DashboardData = staticDashboardData;

export async function GET() {
  // This endpoint is called by the dashboard to get the most recent data.
  // It returns the data from our in-memory store.
  try {
    return NextResponse.json(latestDashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // If there's an error, fall back to the initial static data.
    return NextResponse.json(staticDashboardData, { status: 500 });
  }
}

export async function POST(request: Request) {
  // This endpoint is called by your ESP32 to send new sensor data.
  try {
    const newData = await request.json();
    
    // You could add validation here to ensure the data from the ESP32 is in the correct format.
    // For now, we'll assume it's valid and update our in-memory store.
    latestDashboardData = {
        ...latestDashboardData,
        ...newData,
    };
    
    return NextResponse.json({ message: 'Data received successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing incoming data:', error);
    return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
  }
}
