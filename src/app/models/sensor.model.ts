//sensor.model.ts
import { Reading } from './reading.model';

export interface Sensor {
  type: string;
  readings: Reading[];
  mostRecentReading?: Reading;
}
