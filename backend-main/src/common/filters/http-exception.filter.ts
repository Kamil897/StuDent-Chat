import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse();
      const req = ctx.getRequest();
  
      const isHttp = exception instanceof HttpException;
      const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  
      const payload: any = {
        ok: false,
        status,
        path: req?.url,
        method: req?.method,
        timestamp: new Date().toISOString(),
      };
  
      if (isHttp) {
        const response = (exception as HttpException).getResponse() as any;
        payload.message = response?.message ?? (exception as any).message ?? 'Error';
        payload.error = response?.error ?? undefined;
        payload.details = Array.isArray(response?.message) ? response?.message : undefined;
      } else {
        payload.message = (exception as any)?.message ?? 'Internal server error';
      }
  
      res.status(status).json(payload);
    }
  }
  