import { Day } from "./enums.types";

export type AvailabilityType = {
  id: number; 
   userId: number;

  day: Day;
  from_Time: string;   // TimeSpan מגיע כ־string
  to_Time: string;
};