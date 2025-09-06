import { NextResponse } from 'next/server';
import { staticDashboardData } from '@/lib/data';

export async function GET() {
  // This is where you would fetch data from your live server.
  // For now, we return static data to ensure the app works.
  try {
    // Example of fetching from a real server (currently commented out)
    // const response = await fetch('http://your-actual-server-url/data');
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch data from server: ${response.statusText}`);
    // }
    // const data = await response.json();
    // return NextResponse.json(data);

    // Return static data as a reliable fallback.
    return NextResponse.json(staticDashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // If fetching from your server fails, you could return an error response
    // or fall back to static data.
    return NextResponse.json(staticDashboardData, { status: 500 });
  }
}
