// sensor.model.ts
export interface Sensor {
  type: string;
  value: string;
  timestamp?: string;
}

// pond.model.ts
export interface Pond {
  id: string;
  name: string;
  location?: string; // Added location property
  sensors: Sensor[];
}
