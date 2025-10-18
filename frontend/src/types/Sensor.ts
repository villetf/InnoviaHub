export interface Sensor {
   id: string,
   tenantId: string;
   roomId: number | null;
   model: string;
   serial: string;
   status: string;
}