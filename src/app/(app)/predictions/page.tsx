'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PredictionChart from '@/components/predictions/prediction-chart';
import { staticDashboardData } from '@/lib/data';
import type { DashboardData, PredictionData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PredictionsPage() {
    const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const eventSource = new EventSource('/api/dashboard-data');

        eventSource.onmessage = (event) => {
          try {
            const dashboardData: DashboardData = JSON.parse(event.data);
            if (dashboardData && dashboardData.predictionData) {
              setPredictionData(dashboardData.predictionData);
            } else {
              setPredictionData(staticDashboardData.predictionData);
            }
          } catch (error) {
            console.error('Failed to parse dashboard data:', error);
            setPredictionData(staticDashboardData.predictionData);
          } finally {
            setLoading(false);
          }
        };
    
        eventSource.onerror = (error) => {
          console.error('EventSource failed:', error);
          setPredictionData(staticDashboardData.predictionData);
          setLoading(false);
          eventSource.close();
        };
    
        return () => {
          eventSource.close();
        };
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
