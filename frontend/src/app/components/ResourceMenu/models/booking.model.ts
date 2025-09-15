export type Booking = {
  userId: string;
  resourceId: number;
  startTime: Date;
  endTime: Date;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
};
