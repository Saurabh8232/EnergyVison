import { NextResponse } from 'next/server';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { staticDashboardData } from '@/lib/data';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const dbRef = ref(database, 'dashboardData');

const TimeSeriesDataSchema = z.object({
  time: z.string(),
  power: z.number().optional(),
  battery: z.number().optional(),
  load: z.number().optional(),
  voltage: z.number().optional(),
  current: z.number().optional(),
});

const AlertSchema = z.object({
  id: z.string(),
  level: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

const DeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  type: z.string(),
});

const PredictionDataSchema = z.object({
  time: z.string(),
  actual: z.number().optional(),
  predicted: z.number(),
});

const MetricsSchema = z.object({
  windSpeed: z.number(),
  cloudCoverage: z.number(),
  rain: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  solarPower: z.number(),
  energyGeneration: z.number(),
  energyConsumption: z.number(),
  inverterVoltage: z.number(),
  inverterCurrent: z.number(),
  batteryPercentage: z.number(),
  powerFactor: z.number(),
});

const IncomingDataSchema = z.object({
  solarGenerationData: z.array(TimeSeriesDataSchema),
  batteryLoadData: z.array(TimeSeriesDataSchema),
  solarParametersData: z.array(TimeSeriesDataSchema),
  acParametersData: z.array(TimeSeriesDataSchema),
  predictionData: z.array(PredictionDataSchema),
  alerts: z.array(AlertSchema),
  devices: z.array(DeviceSchema),
  metrics: MetricsSchema,
});

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const keepAlive = setInterval(() => {
        controller.enqueue(': keep-alive\n\n');
      }, 10000);

      const unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      }, (error) => {
        console.error('Firebase read failed:', error);
        controller.enqueue(`data: ${JSON.stringify(staticDashboardData)}\n\n`);
        clearInterval(keepAlive);
        controller.close();
      });

      // When the client closes the connection, unsubscribe from Firebase updates
      return () => {
        clearInterval(keepAlive);
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
