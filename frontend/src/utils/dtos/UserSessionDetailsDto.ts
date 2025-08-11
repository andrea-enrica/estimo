import {UserSessionKeyDto} from "./UserSessionKeyDto";

export interface UserSessionDetailsDto {
  id: UserSessionKeyDto;
  role: string;
  rating: number;
  feedback: string;
  status: string;
}
