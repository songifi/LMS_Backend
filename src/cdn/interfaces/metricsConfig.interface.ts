export interface MetricsConfig {
    enabled: boolean;
    sampleRate: number;
    retentionDays: number;
    alertThresholds: {
      latency: number;
      errorRate: number;
      cacheHitRatio: number;
    };
  }