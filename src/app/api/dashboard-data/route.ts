import { NextResponse } from 'next/server';
import { get, ref } from 'firebase/database';
import { database } from '@/lib/firebase';
import { staticDashboardData } from '@/lib/data';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const maxDuration = 25;

const dbRef = ref(database, 'dashboardData');

const IncomingDataSchema = z.object({
  metrics: z.record(z.any()).optional(),
}).passthrough();

export async function GET() {
  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      return NextResponse.json(snapshot.val());
    } else {
      return NextResponse.json(staticDashboardData);
    }
  } catch (error) {
    console.error('Firebase read failed:', error);
    // Return static data with a 200 OK status to prevent client-side errors
    return NextResponse.json(staticDashboardData, { status: 200 });
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
    
    const validation = IncomingDataSchema.safeParse(rawData);
    if (!validation.success) {
        console.error("Invalid data format received:", validation.error);
        return NextResponse.json({ message: 'Invalid data format.' }, { status: 400, headers });
    }
    
    const newData = validation.data;

    // In a real application you would use `set` or `update` here
    // For this demo, we will log instead of writing to prevent overwrites
    // await set(dbRef, newData);
    console.log("Received data, but POST to database is disabled in this demo.");


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
    'Access-control-allow-headers': 'Content-Type',
  };
  return new Response(null, { status: 204, headers });
}
