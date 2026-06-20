export type DomainEvent =
  | { type: "USER_CREATED"; payload: any }
  | { type: "PAYMENT_SUCCESS"; payload: any }
  | { type: "AUDIT_LOGGED"; payload: any };
