'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Device } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DeviceListProps {
  devices: Device[];
}

export default function DeviceList({ devices: initialDevices }: DeviceListProps) {
  const [devices, setDevices] = useState(initialDevices);

  const handleControlToggle = (deviceId: string, controlKey: 'relayStatus' | 'deepSleep') => {
    setDevices(currentDevices =>
      currentDevices.map(device => {
        if (device.id === deviceId && device.controls) {
          const newControls = { ...device.controls, [controlKey]: !device.controls[controlKey] };
          // Here you would typically also send this change to your backend/device
          console.log(`Toggled ${controlKey} for ${deviceId} to ${newControls[controlKey]}`);
          return { ...device, controls: newControls };
        }
        return device;
      })
    );
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>All Devices</CardTitle>
        <CardDescription>An overview of all registered devices and their current status.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Status</TableHead>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Web Server</TableHead>
                  <TableHead>Relay Status</TableHead>
                  <TableHead>Deep Sleep</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          device.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                        )}></span>
                        <span className="font-medium">{device.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{device.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          device.webServerStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'
                        )}></span>
                        <span>{device.webServerStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`relay-${device.id}`}
                          checked={device.controls?.relayStatus}
                          onCheckedChange={() => handleControlToggle(device.id, 'relayStatus')}
                          disabled={!device.controls}
                          aria-label="Relay Status"
                        />
                         <Label htmlFor={`relay-${device.id}`} className={cn(!device.controls && "text-muted-foreground")}>
                           {device.controls?.relayStatus ? 'On' : 'Off'}
                         </Label>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`sleep-${device.id}`}
                          checked={device.controls?.deepSleep}
                          onCheckedChange={() => handleControlToggle(device.id, 'deepSleep')}
                          disabled={!device.controls}
                          aria-label="Deep Sleep"
                        />
                         <Label htmlFor={`sleep-${device.id}`} className={cn(!device.controls && "text-muted-foreground")}>
                           {device.controls?.deepSleep ? 'On' : 'Off'}
                         </Label>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
