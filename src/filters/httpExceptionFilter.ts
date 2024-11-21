import { HttpAdapterHost } from '@nestjs/core';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const req = context.getRequest<Request>();

    const status =
      (exception as HttpException).getStatus() ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    const msg = (exception as HttpException).message ?? 'Internal server error';
    const path = httpAdapter.getRequestUrl(req);
    const timestamp = new Date().toISOString();
    const errorMessage = `${req.method} - StatusCode: ${status} - Message: ${msg}`;

    this.logger.error(errorMessage, (exception as HttpException).stack);

    const responseBody = { statusCode: status, timestamp, path, msg };

    httpAdapter.reply(response, responseBody, status);
  }
}
