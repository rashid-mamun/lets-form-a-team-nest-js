import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
}
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                data = data ? data : {};
                let message = 'data fetched';
                if (typeof data === 'object') {
                    if (data.message || 'message' in data) {
                        message = data.message;
                        delete data.message;
                    }
                }
                return {
                    success: true,
                    messsage: message,
                    data: data,
                };
            }),
        );
    }
}
