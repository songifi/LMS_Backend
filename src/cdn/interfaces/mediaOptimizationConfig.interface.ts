export interface MediaOptimizationConfig {
    imageFormats: ('webp' | 'avif' | 'jpeg' | 'png')[];
    videoFormats: ('mp4' | 'webm' | 'hls')[];
    imageQuality: number;
    videoQuality: number;
    maxWidth: number;
    enableAdaptiveBitrate: boolean;
    optimizationQueue: {
      concurrency: number;
      retries: number;
    };
  }