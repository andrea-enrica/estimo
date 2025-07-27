import { UserRole } from "../Enums";

export interface UserDto {
  id: number;
  username: string;
  password?: string;
  role: UserRole;
  fullName: string;
  email: string;
  phoneNumber: string;
}
export { UserRole };
