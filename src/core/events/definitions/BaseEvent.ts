export interface BaseEvent {
  id: string;
  timestamp: number;
  type: string;
}

export interface UserLoginEvent extends BaseEvent {
  type: "USER_LOGIN";
  payload: { userId: string; ip: string };
}
