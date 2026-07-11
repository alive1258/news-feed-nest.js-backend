import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

interface ApiDocOptions<TResponse = unknown, TBody = unknown> {
  summary: string;
  description?: string;
  response?: Type<TResponse>;
  body?: Type<TBody>;
  isArray?: boolean;
  status?: number;
  deprecated?: boolean;
}

export function ApiDoc<TResponse = unknown, TBody = unknown>({
  summary,
  description,
  response,
  body,
  isArray = false,
  status = 200,
  deprecated = false,
}: ApiDocOptions<TResponse, TBody>) {
  const decorators = [
    ApiOperation({ summary, description, deprecated }),

    ApiBadRequestResponse({ description: 'Bad Request' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
    ApiNotFoundResponse({ description: 'Not Found' }),
  ];

  if (response) {
    decorators.push(
      ApiResponse({
        status,
        description: 'Successful operation',
        type: response,
        isArray,
      }),
    );
  }

  if (body) {
    decorators.push(ApiBody({ type: body }));
  }

  return applyDecorators(...decorators);
}
