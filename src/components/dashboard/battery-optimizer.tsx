'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { predictOptimalChargingSchedule } from '@/ai/flows/battery-charging-optimization';
import type { PredictOptimalChargingScheduleOutput } from '@/ai/flows/battery-charging-optimization';
import type { Device } from '@/lib/types';
import { Bot, Loader2, Volume2, CalendarClock, Activity, Info } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BatteryOptimizerProps {
  devices: Device[];
}

async function getHistoricalData(deviceId: string) {
    // TODO: Replace with your actual API endpoint
    // The endpoint should return a JSON string of historical data for the given device ID.
    const response = await fetch(`https://example.com/api/historical-data/${deviceId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch historical data');
    }
    return response.json();
}

export default function BatteryOptimizer({ devices }: BatteryOptimizerProps) {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [historicalData, setHistoricalData] = useState<string | null>(null);
  const [result, setResult] = useState<PredictOptimalChargingScheduleOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (selectedDeviceId) {
      const fetchHistoricalData = async () => {
        setIsFetchingData(true);
        setError(null);
        try {
          const data = await getHistoricalData(selectedDeviceId);
          setHistoricalData(JSON.stringify(data));
        } catch (e) {
          setError('Failed to fetch historical data for the selected device.');
          console.error(e);
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchHistoricalData();
    }
  }, [selectedDeviceId]);

  const handleOptimize = async () => {
    if (!selectedDeviceId || !historicalData) {
      setError('Please select a device and ensure its historical data is available.');
      return;
    }
    setIsLoading(true);
    setError(null);
    if(audioRef.current){
        audioRef.current.pause();
        audioRef.current = null;
    }
    setResult(null);

    try {
      const output = await predictOptimalChargingSchedule({
        deviceId: selectedDeviceId,
        historicalBatteryData: historicalData,
      });
      setResult(output);
    } catch (e) {
      setError('Failed to get optimization plan. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const playAudio = () => {
    if (result?.speech) {
        if (!audioRef.current) {
            audioRef.current = new Audio(result.speech);
        }
        audioRef.current.play();
    }
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-accent shrink-0" />
                <div>
                    <CardTitle>AI Battery Charging Optimizer</CardTitle>
                    <CardDescription className="mt-1">
                      Leverage AI to predict optimal charging schedules to maximize battery lifespan.
                    </CardDescription>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Select onValueChange={setSelectedDeviceId} value={selectedDeviceId}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Select a device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleOptimize} disabled={isLoading || isFetchingData || !selectedDeviceId || !historicalData}>
              {(isLoading || isFetchingData) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Analyzing...' : isFetchingData ? 'Loading Data...' : 'Generate Plan'}
            </Button>
        </div>
        
        {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {isLoading && !result && (
            <div className="flex items-center justify-center rounded-lg border p-12">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin"/>
                    <p>AI is analyzing historical data...</p>
                </div>
            </div>
        )}

        {result && (
            <div className="grid gap-4 rounded-lg border p-4">
                <h3 className="font-semibold">Optimization Plan</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col gap-2 rounded-lg bg-muted p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><CalendarClock className="size-4"/>Optimal Schedule</div>
                        <p className="text-sm">{result.optimalChargingSchedule}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-lg bg-muted p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Info className="size-4"/>Rationale</div>
                        <p className="text-sm">{result.rationale}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-lg bg-muted p-4">
                         <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Activity className="size-4"/>Battery Health</div>
                        <div className="flex items-center gap-2">
                            <Progress value={result.healthScore} className="w-[60%]" />
                            <span className="font-semibold">{result.healthScore}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {result.healthScore > 80 ? 'Excellent' : result.healthScore > 60 ? 'Good' : 'Needs attention'}
                        </p>
                    </div>
                </div>
                {result.speech && (
                    <div className="mt-2">
                        <Button variant="outline" size="sm" onClick={playAudio}>
                            <Volume2 className="mr-2 h-4 w-4"/>
                            Listen to Summary
                        </Button>
                    </div>
                )}
            </div>
        )}

      </CardContent>
    </Card>
  );
}
