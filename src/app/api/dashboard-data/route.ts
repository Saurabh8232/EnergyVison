import { NextResponse } from 'next/server';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { staticDashboardData } from '@/lib/data';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const dbRef = ref(database, 'dashboardData');

const IncomingDataSchema = z.object({
  metrics: z.record(z.any()).optional(),
}).strict();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      }, (error) => {
        console.error('Firebase read failed:', error);
        controller.enqueue(`data: ${JSON.stringify(staticDashboardData)}\n\n`);
        controller.close();
      });

      // When the client closes the connection, unsubscribe from Firebase updates
      return () => {
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
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

    await set(dbRef, newData);


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
