export interface DatabasePort {
  query<T = any>(sql: string, params?: any[]): Promise<T>;
}
