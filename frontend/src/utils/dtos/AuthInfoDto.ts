import {UserProfileDto} from "./UserProfileDto";

export interface AuthInfoDto {
  token: string;
  userDetails: UserProfileDto;
}
