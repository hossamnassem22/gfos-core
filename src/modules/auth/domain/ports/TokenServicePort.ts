export interface TokenServicePort {
  signAccess(payload: any): Promise<string>;
  signRefresh(payload: any): Promise<string>;
  verify(token: string): Promise<any>;
}
