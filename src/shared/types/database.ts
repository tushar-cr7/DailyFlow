export interface DatabaseStatus {
  initialized: boolean;
  dbPath: string;
  tableCount: number;
  tables: string[];
  error?: string;
}
