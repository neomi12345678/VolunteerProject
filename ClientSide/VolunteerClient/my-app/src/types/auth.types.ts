
import { UserRole } from "./enums.types";
import {type AvailabilityType } from "./availabilities.types";

export type LoginType = {
  email: string;
  password: string;
};

export type RegisterType = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  street: string;
  userRole: UserRole;
  categoryIds: number[];
  availabilities: AvailabilityType[];
};
