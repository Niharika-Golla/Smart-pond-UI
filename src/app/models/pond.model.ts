// pond.model.ts
import { Sensor } from './sensor.model';

export interface Pond {
  id: string;
  name: string;
  location?: string; // Optional property
  sensors: Sensor[];
}

export { Sensor };
