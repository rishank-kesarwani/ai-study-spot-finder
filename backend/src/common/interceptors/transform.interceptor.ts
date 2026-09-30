import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Request, Response } from 'express';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = (request as any).requestId || request.headers['x-request-id'];

    return next.handle().pipe(
      map((data) => {
        // If the handler already returned an ApiResponse-like shape
        if (data && typeof data === 'object' && 'success' in data && 'statusCode' in data) {
          return {
            ...data,
            requestId,
          };
        }

        return {
          success: true,
          statusCode: response.statusCode,
          data,
          timestamp: new Date().toISOString(),
          requestId,
        };
      }),
    );
  }
}
