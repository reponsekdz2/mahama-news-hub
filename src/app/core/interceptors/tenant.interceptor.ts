
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isApiUrl = request.url.startsWith(environment.fineractApiUrl);
        const tenant = localStorage.getItem('tenant') || environment.defaultTenant;

        if (isApiUrl) {
            request = request.clone({
                setHeaders: {
                    'Fineract-Platform-TenantId': tenant
                }
            });
        }

        return next.handle(request);
    }
}
