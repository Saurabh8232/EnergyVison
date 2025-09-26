
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
          // Fallback to static data if the received data is empty/null
          setData(staticDashboardData);
        }
      } catch (error) {
        console.error('Failed to parse dashboard data, using static data:', error);
        setData(staticDashboardData);
      } finally {
        setLoading(false);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed, using static data:', error);
      setData(staticDashboardData);
      setLoading(false);
      eventSource.close();
    };

    // Clean up the connection when the component unmounts
    return () => {
      eventSource.close();
    };
  }, []); // The empty dependency array ensures this effect runs only once

  const value = { data, loading };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
