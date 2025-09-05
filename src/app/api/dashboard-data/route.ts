import { NextResponse } from 'next/server';

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
      throw new Error(`Failed to fetch data from server: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching from external server:', error);
    // If fetching from your server fails, you could return an error response
    // or fall back to static data.
    return new NextResponse(
      JSON.stringify({ message: 'Failed to fetch live data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
