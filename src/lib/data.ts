import type { Device, TimeSeriesData, Alert, DashboardData, PredictionData } from './types';

export const devices: Device[] = [
  { 
    id: 'esp32-01', 
    name: 'ESP32 Main', 
    status: 'Connected', 
    type: 'Microcontroller',
    webServerStatus: 'Online',
  },
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

export const solarParametersData: TimeSeriesData[] = [
  { time: '00:00', voltage: 0, current: 0 },
  { time: '02:00', voltage: 0, current: 0 },
  { time: '04:00', voltage: 0, current: 0 },
  { time: '06:00', voltage: 350, current: 1.5 },
  { time: '08:00', voltage: 380, current: 5.5 },
  { time: '10:00', voltage: 400, current: 8.8 },
  { time: '12:00', voltage: 410, current: 10.2 },
  { time: '14:00', voltage: 405, current: 9.3 },
  { time: '16:00', voltage: 380, current: 6.5 },
  { time: '18:00', voltage: 360, current: 2.2 },
  { time: '20:00', voltage: 0, current: 0 },
  { time: '22:00', voltage: 0, current: 0 },
];

export const acParametersData: TimeSeriesData[] = [
  { time: '00:00', voltage: 228, current: 5.2 },
  { time: '02:00', voltage: 225, current: 5.1 },
  { time: '04:00', voltage: 226, current: 5.0 },
  { time: '06:00', voltage: 230, current: 6.5 },
  { time: '08:00', voltage: 232, current: 8.1 },
  { time: '10:00', voltage: 231, current: 7.9 },
  { time: '12:00', voltage: 233, current: 7.5 },
  { time: '14:00', voltage: 230, current: 8.2 },
  { time: '16:00', voltage: 229, current: 9.0 },
  { time: '18:00', voltage: 235, current: 10.5 },
  { time: '20:00', voltage: 232, current: 8.5 },
  { time: '22:00', voltage: 230, current: 6.8 },
];

export const alerts: Alert[] = [
  { id: '1', level: 'warning', message: 'Battery level at 25%. Consider reducing load.', timestamp: '2024-05-21T14:30:00Z' },
  { id: '2', level: 'critical', message: 'Grid power outage detected. Switched to battery backup.', timestamp: '2024-05-21T10:05:00Z' },
  { id: '3', level: 'info', message: 'Solar panel cleaning recommended for optimal performance.', timestamp: '2024-05-20T09:00:00Z' },
];

export const predictionData: PredictionData[] = [
  { time: '13:00', actual: 4.2, predicted: 4.1 },
  { time: '14:00', actual: 3.8, predicted: 3.9 },
  { time: '15:00', actual: 3.2, predicted: 3.3 },
  { time: '16:00', actual: 2.5, predicted: 2.6 },
  { time: '17:00', predicted: 1.8 },
  { time: '18:00', predicted: 0.9 },
  { time: '19:00', predicted: 0.2 },
];

export const staticDashboardData: DashboardData = {
  solarGenerationData,
  batteryLoadData,
  solarParametersData,
  acParametersData,
  predictionData,
  alerts,
  metrics: {
    boxTemperature: 32,
    windSpeed: 5.2,
    cloudCoverage: 45,
    rain: 0,
    latitude: 34.0522,
    longitude: -118.2437,
    solarPower: 4.2,
    energy: 15.3,
  }
};
