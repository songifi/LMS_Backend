export interface QueryPerformanceStats {
    queryPattern: string;
    avgExecutionTimeMs: number;
    callCount: number;
    rowsProcessed: number;
  }