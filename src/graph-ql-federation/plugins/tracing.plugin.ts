import { Plugin } from '@nestjs/apollo';
import {
  ApolloServerPlugin,
  GraphQLRequestListener,
  GraphQLRequestContext,
} from 'apollo-server-plugin-base';
import { performance } from 'perf_hooks';

@Plugin()
export class TracingPlugin implements ApolloServerPlugin {
  async requestDidStart(
    requestContext: GraphQLRequestContext,
  ): Promise<GraphQLRequestListener> {
    const start = performance.now();
    const operationName = requestContext.request.operationName || 'anonymous';
    
    console.log(`[Tracing] Operation "${operationName}" started`);
    
    return {
      async willSendResponse(ctx) {
        const end = performance.now();
        const duration = end - start;
        
        console.log(`[Tracing] Operation "${operationName}" completed in ${duration.toFixed(2)}ms`);
        
        // Add tracing data to the response extensions
        if (!ctx.response.extensions) {
          ctx.response.extensions = {};
        }
        
        ctx.response.extensions.tracing = {
          duration,
          startTime: new Date(Date.now() - duration).toISOString(),
          endTime: new Date().toISOString(),
          operation: operationName,
        };
      },
      
      async didEncounterError(ctx) {
        const end = performance.now();
        const duration = end - start;
        
        console.error(`[Tracing] Operation "${operationName}" failed after ${duration.toFixed(2)}ms`, ctx.error);
      },
    };
  }
}
