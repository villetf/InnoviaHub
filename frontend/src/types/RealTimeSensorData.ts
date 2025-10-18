export interface RealTimeSensorData {
   deviceId: string;
   tenantSlug: string;
   time: Date;
   type: string;
   value: Number;
   unit: string;
}