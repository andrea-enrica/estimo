import {UserRole} from "../Enums";

export interface UserProfileDto {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
}
