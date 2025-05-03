export interface TableStats {
    tableName: string;
    rowCount: number;
    sizeBytes: number;
    readThroughput: number; // rows/sec
    writeThroughput: number; // rows/sec
  }