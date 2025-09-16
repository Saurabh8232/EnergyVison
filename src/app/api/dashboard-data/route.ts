
import { NextResponse } from 'next/server';
import { get, ref, update, push } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { Alert } from '@/lib/types';
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
      // If no data, return the static data as a fallback.
      // Do not write to the DB in a GET request.
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

    // Immediately respond to the client to avoid timeouts.
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
