export enum ErrorSeverity { LOW, MEDIUM, HIGH, CRITICAL }

export class BaseException extends Error {
  constructor(
    public message: string,
    public code: string,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public details?: any
  ) {
    super(message);
    this.name = "BaseException";
  }
}
