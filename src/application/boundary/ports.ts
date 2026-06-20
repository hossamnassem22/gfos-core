// Ports = Contracts فقط (لا تنفيذ)

export interface UserRepositoryPort {
  findById(id: string): Promise<any>;
}

export interface DatabasePort {
  query(sql: string, params?: any[]): Promise<any>;
}

export interface EmailSenderPort {
  send(to: string, body: string): Promise<void>;
}
