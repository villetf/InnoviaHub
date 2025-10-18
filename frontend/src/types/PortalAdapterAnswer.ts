import { SensorDataPoint } from "./SensorDataPoint";

export interface PortalAdapterAnswer {
   count: number;
   deviceId: string;
   from: Date | null;
   to: Date | null;
   measurements: SensorDataPoint[];
   type: string | null;
   unit: string | null;
}