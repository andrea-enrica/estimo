import { SessionStatus } from "../Enums";

export interface SessionDto {
  id: number;
  dateCreated: string;
  dateEnded: string;
  title: string;
  status: SessionStatus;
  customValues: string;
  valueType: string;
  creatorId: number;
  sessionManagerId: number;
}
