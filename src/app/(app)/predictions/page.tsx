
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PredictionChart from '@/components/predictions/prediction-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { useData } from '@/context/data-context';

export default function PredictionsPage() {
    const { data, loading } = useData();
    const predictionData = data?.predictionData || [];

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
