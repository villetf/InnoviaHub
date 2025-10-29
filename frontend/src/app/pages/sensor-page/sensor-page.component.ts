import { Component, inject, signal } from '@angular/core';
import { SensorsService } from '../../services/sensors.service';
import * as signalR from '@microsoft/signalr';
import { SensorWithData } from '../../../types/SensorWithData';
import { RealTimeSensorData } from '../../../types/RealTimeSensorData';
import { SensorDataPoint } from '../../../types/SensorDataPoint';
import { HotToastService } from '@ngneat/hot-toast';
import { RealTimeAlert } from '../../../types/RealTimeAlert';

@Component({
  selector: 'app-sensor-page',
  imports: [],
  templateUrl: './sensor-page.component.html',
  styleUrl: './sensor-page.component.css'
})
export class SensorPageComponent {
   sensors = signal<SensorWithData[]>([]);
   sensorsService = inject(SensorsService);
   toast = inject(HotToastService)
   error = signal<Error | null>(null);

   tenantId = '735f1433-60d2-476e-9e9a-8fa8c4e89f90';

   async ngOnInit() {
      this.sensorsService.getAllSensors(this.tenantId)
         .subscribe({
            next: result => {
               for (const sensor of result) {
                  this.sensorsService.getLatestDataFromSensor(this.tenantId, sensor.id)
                     .subscribe(resultData => {
                        const lastMetric = resultData.measurements[resultData.measurements.length - 1];
                        const latestMetrics = resultData.measurements.filter(m => m.time == lastMetric.time);
                        for (const metric of latestMetrics) {
                           if (!sensor.sensorData) {
                              sensor.sensorData = [];
                           }
                           sensor.sensorData?.push({
                              time: metric.time,
                              type: metric.type,
                              value: Number((metric.value!).toFixed(1)),
                              unit: metric.unit
                           })
                        }
                     })
               }
               this.sensors.set(result);
            },
            error: err => {
               console.log('FEL UPSTOOOOOOOOOOOOD');
               this.error.set(err);
            }
         })

      const connection = new signalR.HubConnectionBuilder()
         .withUrl("http://localhost:5103/hub/telemetry")
         .build();
      await connection.start();
      await connection.invoke("JoinTenant", "innovia");
      connection.on("measurementReceived", (data: RealTimeSensorData) => {
         this.sensors.update((sensors) => 
            sensors.map((sensor) => {
               if (sensor.id !== data.deviceId) return sensor;
               const existingIndex = sensor.sensorData?.findIndex(
                  (d) => d.type === data.type
               );

               let updatedSensorData: SensorDataPoint[];

               if (existingIndex != -1) {
                  updatedSensorData = (sensor.sensorData ?? []).map((d, i) =>
                     i === existingIndex
                        ? { ...d, value: Number((data.value).toFixed(1)), time: data.time, unit: data.unit }
                        : d
                  );
               } else {
                  if (!sensor.sensorData) {
                     sensor.sensorData = []
                  }
                  updatedSensorData = [
                     ...sensor.sensorData,
                     { 
                        type: data.type,
                        value: Number((data.value).toFixed(1)),
                        time: data.time,
                        unit: data.unit
                     }
                  ]
               }

               return { ...sensor, sensorData: updatedSensorData }
            }
         ))
      });

      connection.on("alertReceived", (alert: RealTimeAlert) => {
         console.log('alert mottagen:', alert);
         switch (alert.severity) {
            case 'warning':
               this.toast.warning(`${alert.severity}: ${alert.message}`, {
                  duration: 10000
               });
               break;
            case 'critical':
               this.toast.error(`${alert.severity}: ${alert.message}`, {
                  duration: 10000
               });
               break;
            default:
               this.toast.info(`${alert.severity}: ${alert.message}`, {
                  duration: 10000
               });
               break;
         }
         
      });
   }

   formatTime(date: Date) {
      let formattedTime = ''; 
      date = new Date(date);

      if (date.getDate() === new Date().getDate()) {
         formattedTime += 'Idag '
      } else {
         formattedTime += date.toDateString() + ' ';
      }

      formattedTime += date.toLocaleTimeString();
      return formattedTime;
   }

   formatMetricType(type: string) {
      if (type == 'temperature') {
         return 'Temperatur'
      }

      if (type == 'co2') {
         return 'CO<sub>2</sub>';
      }

      return type;
   }
}
