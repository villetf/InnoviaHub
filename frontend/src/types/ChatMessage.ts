import { BookingObject } from "./BookingObject";

export interface ChatMessage {
   author: "user" | "bot",
   text: string;
   bookingObjects?: BookingObject[]
}