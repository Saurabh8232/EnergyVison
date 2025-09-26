
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { DashboardData } from '@/lib/types';
import { staticDashboardData } from '@/lib/data';

interface DataContextType {
  data: DashboardData | null;
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  data: null,
  loading: true,
});

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource('/api/dashboard-data');

    eventSource.onmessage = (event) => {
      try {
        const dashboardData: DashboardData = JSON.parse(event.data);
        if (dashboardData) {
          setData(dashboardData);
        } else {
          setData(staticDashboardData);
        }
      } catch (error) {
        console.error('Failed to parse dashboard data:', error);
        setData(staticDashboardData);
      } finally {
        setLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      setData(staticDashboardData);
      setLoading(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const value = { data, loading };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
