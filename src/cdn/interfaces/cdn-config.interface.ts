import { CacheConfig } from "src/database-performance";
import { EdgeNodeConfig } from "./edgeNodeConfig.interfac";
import { MediaOptimizationConfig } from "./mediaOptimizationConfig.interface";
import { PreloadingConfig } from "./preloadingConfig.interface";
import { MetricsConfig } from "./metricsConfig.interface";

export interface CdnConfig {
    edgeNodes: EdgeNodeConfig[];
    mediaOptimization: MediaOptimizationConfig;
    preloading: PreloadingConfig;
    cache: CacheConfig;
    metrics: MetricsConfig;
  }

  