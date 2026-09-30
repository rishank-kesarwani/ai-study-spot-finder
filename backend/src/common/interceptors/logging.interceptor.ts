import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const requestId = (request as any).requestId || request.headers['x-request-id'] || 'no-id';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const delay = Date.now() - now;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${statusCode} +${delay}ms - ${ip} - ${userAgent.slice(0, 40)}`,
          );
        },
        error: (error) => {
          const delay = Date.now() - now;
          const status = error.status || 500;
          this.logger.warn(
            `[${requestId}] ${method} ${url} ${status} +${delay}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
