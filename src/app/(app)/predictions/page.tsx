import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import PredictionChart from '@/components/predictions/prediction-chart';
import { predictionData as staticPredictionData } from '@/lib/data';
import type { PredictionData } from '@/lib/types';

async function getPredictionData(): Promise<PredictionData[]> {
  // In a real app, you'd fetch this from your API
  return Promise.resolve(staticPredictionData);
}

export default async function PredictionsPage() {
    const predictionData = await getPredictionData();
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
            <PredictionChart data={predictionData} />
        </CardContent>
      </Card>
    </main>
  );
}
