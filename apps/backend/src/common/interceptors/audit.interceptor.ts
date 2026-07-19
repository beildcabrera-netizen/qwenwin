import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      const body = request.body;
      // Inyectar automáticamente createdBy y updatedBy
      if (body && typeof body === 'object') {
        if (!body.createdBy) {
          body.createdBy = user.sub; // user.id del JWT
        }
        if (!body.updatedBy) {
          body.updatedBy = user.sub;
        }
      }
    }

    return next.handle();
  }
}
