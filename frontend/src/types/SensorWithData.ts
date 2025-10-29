import { Sensor } from "./Sensor";
import { SensorDataPoint } from "./SensorDataPoint";

export interface SensorWithData extends Sensor {
   sensorData?: SensorDataPoint[]
}