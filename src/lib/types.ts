export type Device = {
  id: string;
  name: string;
  status: 'Connected' | 'Disconnected';
  type: string;
  webServerStatus: 'Online' | 'Offline';
};

export type TimeSeriesData = {
  time: string;
  [key: string]: number | string;
};

export type Alert = {
  id: string;
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
};

export type PredictionData = {
  time: string;
  actual?: number;
  predicted: number;
}

export type DashboardMetrics = {
    boxTemperature: number;
    windSpeed: number;
    cloudCoverage: number;
    rain: number;
    latitude: number;
    longitude: number;
    solarPower: number;
    energy: number;
}

export type DashboardData = {
  solarGenerationData: TimeSeriesData[];
  batteryLoadData: TimeSeriesData[];
  solarParametersData: TimeSeriesData[];
  acParametersData: TimeSeriesData[];
  predictionData: PredictionData[];
  alerts: Alert[];
  metrics: DashboardMetrics;
};
