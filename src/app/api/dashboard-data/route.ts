import { NextResponse } from 'next/server';
import { staticDashboardData } from '@/lib/data';

export async function GET() {
  // This is the ONLY place you need to change to connect to your live data.
  // Replace the URL with your actual server's endpoint.
  // Because this request is made from the server, there are no CORS issues.
  try {
    const response = await fetch('http://your-actual-server-url/data', {
      // If your server requires an API key or other headers, add them here.
      // headers: {
      //   'Authorization': `Bearer ${process.env.YOUR_SERVER_API_KEY}`
      // }
    });

    if (!response.ok) {
      // If the call fails, log the error and fall back to static data
      console.error(`Failed to fetch data from server: ${response.statusText}`);
      return NextResponse.json(staticDashboardData);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching from external server:', error);
    // If fetching from your server fails, you could return an error response
    // or fall back to static data.
     return NextResponse.json(staticDashboardData);
  }
}
