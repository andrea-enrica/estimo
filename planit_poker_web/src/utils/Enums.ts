export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  MANAGER = "MANAGER",
  OBSERVER = "OBSERVER"
}

export enum SessionStatus {
  IDLE = "IDLE",
  ACTIVE = "ACTIVE",
  ENDED = "ENDED"
}

export enum UserSessionRole {
  USER = "USER",
  MANAGER = "MANAGER",
  OBSERVER = "OBSERVER"
}

export enum LocalStorageProperties {
  token = "token",
  id = "id",
  role = "role",
  email = "email",
  userDisconnected = "userDisconnected"
}

export enum ValueTypesEnum {
  Fibonacci = "Fibonacci",
  Scrum = "Scrum",
  Tshirt = "T-shirt",
  Sequential = "Sequential",
  Hours = "Hours"
}

export enum FilterSessionsEnum {
  SESSIONS = "Sessions",
  INVITED = "Invited",
  MANAGED = "Managed",
  CREATE_SESSION = "Create Session",
  NO_SESSIONS = "No sessions available at the moment",
  SHOWING = "Currently Showing"
}

export enum UserModalEnum {
  edit = "edit",
  add = "add"
}

export enum SessionDetails {
  ADD_STORY = "Add Story"
}

export enum SessionDashboard{
  WAITING_TO_START = "Waiting to start",
  STORY_DETAILS = "Details",
  ADD_FEEDBACK = "Add feedback",
  SESSION_ACTIONS = "Actions",
  START_SESSION = "Start session",
  FINISH_SESSION = "Finish session",
  NEXT_STORY = "Next story",
  STOP_ESTIMATION = "Stop estimation",
  REVOTE = "Revote",
  INVITE_USERS = "Invite users",
  SHOW_STATISTICS = "Show statistics",
  LEAVE_SESSION = "Leave session",
  FLIP_CARDS = "Flip all cards"
}