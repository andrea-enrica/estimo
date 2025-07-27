import { UserSessionRole } from "../Enums";
import { UserRole } from "./UserDto";

export interface UserMessageDto {
  userId: number;
  userFullName: string;
  storyId: number;
  sessionId: number;
  estimation: string;
  votedTime: string;
  hasVoted: boolean;
  position: number;
  role: UserSessionRole;
}
