import { UserStoryKey } from "./UserStoryKey";

export interface UserStoryDetailsDto {
  id: UserStoryKey;
  estimation: string;
  votedTime: string;
}
