import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "../core/app-config.service";
import { Observable } from "rxjs";
import { SensorWithData } from "../../types/SensorWithData";
import { PortalAdapterAnswer } from "../../types/PortalAdapterAnswer";

@Injectable({ providedIn: 'root' })
export class SensorsService {
   private readonly deviceRegistryUrl: string;
   private readonly portalAdapterUrl: string;

   constructor(private http: HttpClient, private cfg: AppConfigService) {
      this.deviceRegistryUrl = `${this.cfg.deviceRegistryUrl}`;
      this.portalAdapterUrl = `${this.cfg.portalAdapterUrl}`;
   }

   getAllSensors(tenant: string): Observable<SensorWithData[]> {
      return this.http.get<SensorWithData[]>(`${this.deviceRegistryUrl}/api/tenants/${tenant}/devices/`);
   }

   getLatestDataFromSensor(tenant: string, sensorId: string): Observable<PortalAdapterAnswer> {
      return this.http.get<PortalAdapterAnswer>(`${this.portalAdapterUrl}/portal/${tenant}/devices/${sensorId}/measurements?`)
   }
}