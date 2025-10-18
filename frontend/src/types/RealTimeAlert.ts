export interface RealTimeAlert {
   deviceId: string;
   message: string;
   ruleId: string;
   severity: string;
   tenantId: string;
   time: Date;
   type: string;
   value: number;
}