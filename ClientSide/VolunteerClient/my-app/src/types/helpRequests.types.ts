import type { AvailabilityType } from "./availabilities.types";
import { HelpRequestStatus } from "./enums.types";

export type HelpRequestType = {
  id: number;
  needyID: number;
  categoryID: number;
  description: string;
  status: HelpRequestStatus;
  createdAt: string;
    availability: AvailabilityType;
  
  

};