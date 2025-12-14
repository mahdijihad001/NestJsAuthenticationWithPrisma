import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    const errorStore = [];

    // Prisma Unique Constraint Failed (Duplicate Entry)
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        const field = exception.meta?.target?.[0];
        statusCode = 400;
        message = `${field} already exists`;
      }

      // Record Not Found
      if (exception.code === 'P2025') {
        statusCode = 404;
        message = 'Record not found';
      }
    }

    // Validation Error (Wrong data structure)
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400;
      message = 'Invalid data sent to Prisma';
    }

    // Normal JS Error
    else if (exception instanceof Error) {
      statusCode = 400;
      message = exception.message;
    }

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: errorStore,
      stack: exception.stack,
    });
  }
}
