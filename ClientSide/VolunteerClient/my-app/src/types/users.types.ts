import { UserRole } from "./enums.types";
import { type CategoryType } from "./categories.types";
import { type AvailabilityType } from "./availabilities.types";

export type UserType = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  adress: string;
  userRole: UserRole;
  rating: number;
  categories: CategoryType[];
  availabilities: AvailabilityType[];
};