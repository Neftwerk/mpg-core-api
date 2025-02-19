import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { sentenceCase } from 'change-case-all';
import { Request, Response } from 'express';

@Catch(HttpException)
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = this.createErrorResponse(exception, request);

    response.status(status).json(errorResponse);
  }

  private createErrorResponse(
    exception: HttpException,
    request: Request,
  ): {
    error: {
      status: string;
      source: { pointer: string };
      title: string;
      detail: string;
    };
  } {
    const exceptionResponse = exception.getResponse();
    const errorInfo = Array.isArray(exceptionResponse)
      ? exceptionResponse[0]
      : exceptionResponse;

    const errorTitle =
      errorInfo?.title ||
      sentenceCase(exception.name.replace('Exception', '')) ||
      'An error occurred';

    const errorDetail =
      errorInfo?.detail || errorInfo?.message || 'An error occurred';

    const errorSourcePointer = errorInfo?.pointer || request.url;

    const error = {
      status: errorInfo?.status || String(exception.getStatus()),
      source: { pointer: errorSourcePointer },
      title: errorTitle,
      detail: errorDetail,
    };

    return {
      error,
    };
  }
}
