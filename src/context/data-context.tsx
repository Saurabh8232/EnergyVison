
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
    // Fallback to static data if no live data is received after a short delay
    const initialLoadTimeout = setTimeout(() => {
      if (loading) {
        console.log("No live data received, falling back to static data.");
        setData(staticDashboardData);
        setLoading(false);
      }
    }, 3000); // Wait 3 seconds for live data before showing static data

    const eventSource = new EventSource('/api/dashboard-data');

    eventSource.onopen = () => {
        console.log("EventSource connection opened.");
    };
    
    eventSource.onmessage = (event) => {
      // Ignore keep-alive messages
      if (event.data.startsWith(':')) {
          return;
      }
      
      try {
        const dashboardData: DashboardData = JSON.parse(event.data);
        if (dashboardData) {
          clearTimeout(initialLoadTimeout); // We got data, so cancel the static data fallback
          setData(dashboardData);
          if (loading) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to parse dashboard data:', error);
        // If there's an error parsing, we might still fallback, so don't close loading state here.
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed, using static data:', error);
      clearTimeout(initialLoadTimeout); // Cancel timeout as we are handling the error now
      if (loading) { // Only set static data if we are in the initial loading phase
          setData(staticDashboardData);
          setLoading(false);
      }
      eventSource.close();
    };

    // Clean up the connection when the component unmounts
    return () => {
      clearTimeout(initialLoadTimeout);
      eventSource.close();
    };
  }, [loading]); // Rerun effect if loading state changes, though it mainly runs once.

  const value = { data, loading };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
