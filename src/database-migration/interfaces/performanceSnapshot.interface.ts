import { IndexStats } from "./indexStats.interface";
import { QueryPerformanceStats } from "./queryPerformanceStats.interface";
import { TableStats } from "./tableStats.interface";

export interface PerformanceSnapshot {
    timestamp: Date;
    tableStats: Record<string, TableStats>;
    indexStats: Record<string, IndexStats>;
    queryStats: QueryPerformanceStats[];
  }