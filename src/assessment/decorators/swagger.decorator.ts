import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export function ApiAssessmentDocs() {
  return applyDecorators(
    ApiTags('assessments'),
    ApiOperation({ summary: 'Assessment related operations' }),
    ApiResponse({ status: 200, description: 'The operation was successful' }),
    ApiResponse({ status: 400, description: 'Bad request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
}
