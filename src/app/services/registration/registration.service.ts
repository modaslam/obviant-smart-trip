import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as env from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  apiBaseUrl: string = '';

  constructor(private http: HttpClient) { 

    this.apiBaseUrl = env.environment.serverUrl;

  }

  registerUser(userForm) {
    return new Promise(resolve => {
      this.http.post(this.apiBaseUrl + 'users', userForm).subscribe(data => {
        resolve(data);
      }, err => {
        console.log(err);
      })
    });
  }
}
