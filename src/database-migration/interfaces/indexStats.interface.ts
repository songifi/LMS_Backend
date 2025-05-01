export interface IndexStats {
    indexName: string;
    tableName: string;
    usageCount: number;
    scanCount: number;
    sizeBytes: number;
  }