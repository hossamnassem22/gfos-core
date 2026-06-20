export interface AgreementRepository {
  findById(id: string): Promise<any>;
  list(): Promise<any[]>;
}
