// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class JwtInterceptorService {

//   constructor() { }
// }
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import {tap} from 'rxjs/internal/operators';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../authentication/authentication.service';
/*

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class JwtInterceptorService implements HttpInterceptor {
  constructor(private injector: Injector) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // do stuff with response if you want
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            // redirect to the login route
            // or show a modal
          }
        }
      })
    );
  }
}