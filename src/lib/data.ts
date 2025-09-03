import type { Device, TimeSeriesData } from './types';

export const devices: Device[] = [
  { id: 'device-01', name: 'Main Power Unit', status: 'Connected', type: 'Battery' },
  { id: 'device-02', name: 'Solar Panel Array 1', status: 'Connected', type: 'Solar' },
  { id: 'device-03', name: 'Backup Generator', status: 'Disconnected', type: 'Generator' },
  { id: 'device-04', name: 'Building A Sub-meter', status: 'Connected', type: 'Meter' },
  { id: 'device-05', name: 'HVAC System', status: 'Connected', type: 'HVAC' },
];

export const solarGenerationData: TimeSeriesData[] = [
  { time: '00:00', power: 0 },
  { time: '02:00', power: 0 },
  { time: '04:00', power: 0 },
  { time: '06:00', power: 0.5 },
  { time: '08:00', power: 2.1 },
  { time: '10:00', power: 3.5 },
  { time: '12:00', power: 4.2 },
  { time: '14:00', power: 3.8 },
  { time: '16:00', power: 2.5 },
  { time: '18:00', power: 0.8 },
  { time: '20:00', power: 0 },
  { time: '22:00', power: 0 },
];

export const batteryLoadData: TimeSeriesData[] = [
  { time: '00:00', battery: 60, load: 1.2 },
  { time: '02:00', battery: 55, load: 1.1 },
  { time: '04:00', battery: 50, load: 1.0 },
  { time: '06:00', battery: 52, load: 1.5 },
  { time: '08:00', battery: 60, load: 2.0 },
  { time: '10:00', battery: 75, load: 1.8 },
  { time: '12:00', battery: 85, load: 1.7 },
  { time: '14:00', battery: 90, load: 1.9 },
  { time: '16:00', battery: 88, load: 2.2 },
  { time: '18:00', battery: 82, load: 2.5 },
  { time: '20:00', battery: 75, load: 2.1 },
  { time: '22:00', battery: 68, load: 1.5 },
];
