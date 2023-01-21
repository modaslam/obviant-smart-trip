import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../authentication/authentication.service';

/*

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TokenInterceptorService implements HttpInterceptor {
  constructor(private injector: Injector) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authentication = this.injector.get(AuthenticationService);
    // console.log(request);
    // if(!request.url.startsWith('http://localhost:3000/api/users?filter'))
    if(authentication.getUserData())
      request = request.clone({
        setHeaders: {
          Authorization: authentication.getUserData().id
        }
      });
    return next.handle(request);
  }
}
