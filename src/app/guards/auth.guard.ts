import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(public authenticationService: AuthenticationService) {}

  canActivate(): boolean {
    return this.authenticationService.isAuthenticated();
  }
}
