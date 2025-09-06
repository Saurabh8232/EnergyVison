import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Alert } from '@/lib/types';
import { alerts as staticAlerts } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';

const alertIcons = {
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  critical: <ShieldAlert className="h-5 w-5 text-red-500" />,
};

const alertColors = {
  info: 'border-blue-500/50 bg-blue-500/10',
  warning: 'border-yellow-500/50 bg-yellow-500/10',
  critical: 'border-destructive/50 bg-destructive/10 text-destructive-foreground',
};

async function getAlerts(): Promise<Alert[]> {
  // In a real app, you would fetch this from your API
  // For now, we return static data and reverse it to show newest first.
  return Promise.resolve([...staticAlerts].reverse());
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>A log of all system events and notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={cn('flex items-start gap-4 rounded-lg border p-4', alertColors[alert.level])}>
                <div className="mt-1">
                    {alertIcons[alert.level]}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
