'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Alert, DashboardData } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { staticDashboardData } from '@/lib/data';

const alertIcons = {
  info: <Info className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  critical: <ShieldAlert className="h-5 w-5" />,
};

const alertColors = {
  info: 'border-blue-500/50 bg-blue-500/10',
  warning: 'border-yellow-500/50 bg-yellow-500/10',
  critical: 'border-red-500/50 bg-red-500/10',
};


export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource('/api/dashboard-data');

    eventSource.onmessage = (event) => {
      try {
        const dashboardData: DashboardData = JSON.parse(event.data);
        if (dashboardData && dashboardData.alerts) {
            const alertData = Object.values(dashboardData.alerts).reverse();
            setAlerts(alertData);
        } else {
            setAlerts(Object.values(staticDashboardData.alerts).reverse());
        }
      } catch (error) {
        console.error('Failed to parse dashboard data:', error);
        setAlerts(Object.values(staticDashboardData.alerts).reverse());
      } finally {
        setLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setAlerts(Object.values(staticDashboardData.alerts).reverse());
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
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>A log of all system events and notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-[78px] w-full" />
                ))}
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((alert) => {
                  const alertDate = new Date(alert.timestamp);
                  return (
                      <div key={alert.id} className={cn('flex items-start gap-4 rounded-lg border p-4', alertColors[alert.level])}>
                          <div className="mt-1">
                              {alertIcons[alert.level]}
                          </div>
                          <div className="flex-1 space-y-1">
                          <p className="font-medium">{alert.message}</p>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{formatDistanceToNow(alertDate, { addSuffix: true })}</span>
                              <span className="text-xs text-muted-foreground/80">({format(alertDate, "yyyy-MM-dd HH:mm:ss")})</span>
                          </div>
                          </div>
                      </div>
                  );
              }) : <p>No alerts to display.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
