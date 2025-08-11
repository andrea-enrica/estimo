import {SessionDto} from "./SessionDto";

export interface InviteRequestDto {
  invitedUsers: string[];
  session: SessionDto;
}
