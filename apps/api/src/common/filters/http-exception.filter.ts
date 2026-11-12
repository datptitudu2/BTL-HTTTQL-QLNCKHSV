import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau.';
    let code = 'INTERNAL_SERVER_ERROR';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      title = exception.name;

      if (typeof res === 'string') {
        detail = res;
      } else if (typeof res === 'object' && res !== null) {
        const anyRes = res as any;
        detail = anyRes.message || anyRes.detail || detail;
        code = anyRes.code || code;
        errors = anyRes.errors || anyRes.invalidParams;
      }
    } else if (exception instanceof Error) {
      detail = process.env.NODE_ENV === 'production'
        ? 'Đã có lỗi hệ thống xảy ra. Vui lòng liên hệ quản trị viên.'
        : exception.message;
    }

    response.status(status).setHeader('Content-Type', 'application/problem+json').json({
      type: `https://srms.ptit.edu.vn/errors/${code.toLowerCase()}`,
      title,
      status,
      code,
      detail: Array.isArray(detail) ? detail.join(', ') : detail,
      instance: request.url,
      timestamp: new Date().toISOString(),
      ...(errors ? { errors } : {}),
    });
  }
}

