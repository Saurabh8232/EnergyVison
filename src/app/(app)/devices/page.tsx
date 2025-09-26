
'use client';

import DeviceList from '@/components/devices/device-list';
import { Skeleton } from '@/components/ui/skeleton';
import { useData } from '@/context/data-context';

export default function DevicesPage() {
  const { data, loading } = useData();

  const devices = data?.devices || [];
  
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
       {loading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <DeviceList devices={devices} />
      )}
    </main>
  );
}
