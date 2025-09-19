// Joel's ändringar för rätt userinfo - Lade till userName i alla booking-interfaces för att visa namn istället för GUID
export type Booking = {
  userId: string; // Azure AD Object ID (oid)
  userName?: string; // Joel's ändringar: Display name från Azure AD
  resourceId: number;
  startTime: Date;
  endTime: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
};

export interface BookingRead {
  id: number;
  userId: string; // Azure AD Object ID (oid)
  userName?: string; // Joel's ändringar: Display name från Azure AD
  resourceId: number;
  resourceName?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  status: string;
  createdAt: string; // ISO
}

export interface BookingUpdateDto {
  userId: string;
  userName?: string; // Joel's ändringar: Display name från Azure AD
  resourceId: number;
  startTime: string; // ISO
  endTime: string; // ISO
  status: string;
}
