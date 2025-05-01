import { QueryPerformanceStats } from "./queryPerformanceStats.interface";

export interface PerformanceImpact {
  beforeSnapshot: Date;
  afterSnapshot: Date;
  tableGrowth: Record<string, number>; // percentage
  indexGrowth: Record<string, number>; // percentage
  slowedQueries: QueryPerformanceStats[];
  improvedQueries: QueryPerformanceStats[];
  recommendations: string[];
}
