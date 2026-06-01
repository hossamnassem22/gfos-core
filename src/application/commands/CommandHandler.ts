export interface CommandHandler<T = unknown> {
  execute(command: T): Promise<void>;
}	
		
