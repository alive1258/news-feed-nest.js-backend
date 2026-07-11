import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response, Request } from 'express';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const error = exception as QueryFailedError & {
      driverError: { code: string; detail?: string };
    };
    const errorCode = error.driverError?.code;
    const errorDetail = error.driverError?.detail;

    const status = this.getHttpStatus(errorCode);
    const { message, hint } = this.getErrorMessageAndHint(
      errorCode,
      errorDetail,
    );

    return response.status(status).json({
      apiVersion: '0.1.1',
      success: false,
      status,
      error: HttpStatus[status],
      message,
      details: errorDetail ?? error.message,
      hint,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getHttpStatus(errorCode?: string): number {
    switch (errorCode) {
      case '23503': // FK violation
      case '23514': // Check constraint
      case '23502': // Not null
      case '22P02': // Invalid UUID
        return HttpStatus.UNPROCESSABLE_ENTITY; // 422

      case '23505': // Unique constraint
        return HttpStatus.CONFLICT; // 409

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR; // 500
    }
  }

  private getErrorMessageAndHint(errorCode?: string, detail?: string) {
    switch (errorCode) {
      case '23503':
        return {
          message:
            detail ??
            'Cannot delete or modify this record as it is referenced elsewhere.',
          hint: 'Check related records before deleting or updating.',
        };
      case '23505':
        return {
          message:
            detail ?? 'Duplicate entry found. This record already exists.',
          hint: 'Ensure unique fields are not duplicated.',
        };
      case '22P02':
        return {
          message: detail ?? 'Invalid input format.',
          hint: 'Check UUIDs or numeric fields for correct format.',
        };
      case '42703':
        return {
          message: detail ?? 'Invalid query. Column does not exist.',
          hint: 'Check your database schema and column names.',
        };
      case '23514':
        return {
          message: detail ?? 'Failed to satisfy a database constraint.',
          hint: 'Verify input values meet database constraints.',
        };
      case '23502':
        return {
          message: 'A required field is missing.',
          hint: 'Provide all required fields in the request.',
        };
      default:
        return {
          message: 'An unexpected error occurred. Please try again later.',
          hint: 'Check server logs for more information.',
        };
    }
  }
}
