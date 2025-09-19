export type Booking = {
  userId: string;
  userName?: string;
  resourceId: number;
  startTime: Date;
  endTime: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
};

export interface BookingRead {
  id: number;
  userId: string;
  userName?: string;
  resourceId: number;
  resourceName?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  status: string;
  createdAt: string; // ISO
}

export interface BookingUpdateDto {
  userId: string;
  userName?: string;
  resourceId: number;
  startTime: string; // ISO
  endTime: string; // ISO
  status: string;
}
