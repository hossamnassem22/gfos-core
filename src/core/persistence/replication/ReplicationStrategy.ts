export interface ReplicationStrategy {
  replicate(data: any): Promise<boolean>;
  validateIntegrity(checksum: string): Promise<boolean>;
}
