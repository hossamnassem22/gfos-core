export class ApiResponse {
  static success(data: any) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string) {
    return {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}
