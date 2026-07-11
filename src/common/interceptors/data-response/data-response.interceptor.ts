import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { map, Observable } from 'rxjs';
import { AuthResponse, StandardResponse } from '../response-dto/response-dto';
import { IPagination } from 'src/common/data-query/pagination.interface';
@Injectable()
export class DataResponseInterceptor<
  T extends AuthResponse,
> implements NestInterceptor<T, StandardResponse<T>> {
  private readonly ONE_HOUR = 1000 * 60 * 60;
  private readonly ONE_DAY = this.ONE_HOUR * 24;

  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    // const domain = this.configService.get<string>('BASE_DOMAIN_NAME');

    const setCookie = (name: string, value: string, maxAge: number): void => {
      response.cookie(name, value, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        // domain,
        path: '/',
        maxAge,
      });
    };

    const clearCookie = (name: string): void => {
      response.clearCookie(name, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        // domain,
        path: '/',
      });
    };

    const actionMessage = (request: Request, data: any) => {
      const method = request.method;
      const path = request.path.toLowerCase();

      if (method === 'POST') return `Operation successfully`;
      if (method === 'PUT' || method === 'PATCH') return `Updated successfully`;
      if (method === 'DELETE') return `Deleted successfully`;
      if (method === 'GET' && Array.isArray(data?.data))
        return `All items retrieved successfully`;
      if (method === 'GET') return `Item retrieved successfully`;
      return 'Operation Successful';
    };

    const generateLinks = (resource: any, request: Request) => {
      if (!resource?.id) return undefined;

      const apiPrefix = '/api/v1/';
      const pathAfterPrefix = request.originalUrl
        .replace(apiPrefix, '')
        .split('/');

      const resourceName = pathAfterPrefix[0];
      const isDelete = request.method === 'DELETE';
      const isCreate = request.method === 'POST';

      if (isDelete) {
        return {
          get: `/${resourceName}/${resource.id}`,
        };
      }

      return {
        ...(isCreate ? { self: `/${resourceName}/create` } : {}),
        get: `/${resourceName}/${resource.id}`,
        update: `/${resourceName}/${resource.id}`,
        delete: `/${resourceName}/${resource.id}`,
      };
    };

    return next.handle().pipe(
      map((data: T): StandardResponse<T> => {
        const apiVersion =
          this.configService.get<string>('appConfig.apiVersion') ?? '1.0';

        /**
         * VERIFY OTP (login)
         */
        if (
          request.path === '/api/v1/auth/sign-in' &&
          typeof data.accessToken === 'string' &&
          typeof data.refreshToken === 'string'
        ) {
          setCookie('accessToken', data.accessToken, this.ONE_HOUR);
          setCookie('refreshToken', data.refreshToken, this.ONE_DAY);

          delete data.accessToken;
          delete data.refreshToken;
        }

        /**
         * REFRESH TOKEN
         */
        if (
          request.path === '/api/v1/auth/refresh-token' &&
          typeof data.accessToken === 'string'
        ) {
          setCookie('accessToken', data.accessToken, this.ONE_HOUR);

          if (
            typeof data.newRefreshToken === 'string' &&
            typeof data.ttl === 'number'
          ) {
            setCookie('refreshToken', data.newRefreshToken, data.ttl * 1000);
          }

          delete data.accessToken;
          delete data.newRefreshToken;
          delete data.ttl;
        }

        /**
         * LOGOUT
         */
        if (['/api/v1/auth/sign-out'].includes(request.path)) {
          clearCookie('accessToken');
          clearCookie('refreshToken');
        }

        const basePath = request.baseUrl + request.path.split('/')[1];
        // Check if response is paginated
        const isPaginated =
          data &&
          typeof data === 'object' &&
          'meta' in data &&
          'links' in data &&
          'data' in data;

        if (isPaginated) {
          const {
            meta,
            links,
            data: payload,
            ...rest
          } = data as IPagination<any>;
          return {
            apiVersion,
            success: true,
            message: 'Operation Successful',
            status: HttpStatus.OK,
            meta,
            links,
            ...rest,
            data: payload,
          };
        }

        // Single resource
        const links =
          data && typeof data === 'object'
            ? generateLinks(data, request)
            : undefined;

        const message = actionMessage(request, data);
        return {
          apiVersion,
          success: true,
          message,
          status: HttpStatus.OK,
          data: data,
          links,
        };
      }),
    );
  }
}
