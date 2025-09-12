'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PredictionChart from '@/components/predictions/prediction-chart';
import { staticDashboardData } from '@/lib/data';
import type { DashboardData, PredictionData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

async function getPredictionData(): Promise<PredictionData[]> {
  try {
    const response = await fetch('/api/dashboard-data', {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch prediction data, status:', response.status);
      return staticDashboardData.predictionData;
    }
    const data: DashboardData = await response.json();
    return data.predictionData || staticDashboardData.predictionData;
  } catch (error) {
    console.error('API call failed, returning static data:', error);
    return staticDashboardData.predictionData;
  }
}

export default function PredictionsPage() {
    const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getPredictionData();
            setPredictionData(data);
            setLoading(false);
        };

        fetchData();

        const interval = setInterval(fetchData, 30000);

        return () => clearInterval(interval);
    }, []);

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
       <Card>
        <CardHeader>
          <CardTitle>Solar Power Prediction</CardTitle>
          <CardDescription>
            Predicted solar power generation for the next few hours based on historical data and weather forecasts.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <Skeleton className="h-[300px] w-full" />
            ) : (
                <PredictionChart data={predictionData} />
            )}
        </CardContent>
      </Card>
    </main>
  );
}
