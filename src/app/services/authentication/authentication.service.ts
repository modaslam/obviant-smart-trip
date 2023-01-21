import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { AlertService } from '../alert/alert.service';
import * as env from '../../../environments/environment';

declare var cordova: any;

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  userId: string;
  token: string;
  apiBaseUrl: string = '';
  private userData;
  userDetails: any;
  authenticationState = new BehaviorSubject(false);

  constructor(
    private platform: Platform, 
    private http: HttpClient, 
    private storage: Storage,
    public alertService: AlertService
  ) { 
    // serverUrl: 'http://localhost:3000/api/'
    this.apiBaseUrl = env.environment.serverUrl;

    this.platform.ready().then(() => {
      this.checkToken();
    });

  }

  // If token exists in storage, user is authenticated.
  checkToken() {
    this.storage.get(TOKEN_KEY).then(res => {
      if(res) {
        this.authenticationState.next(true);
      }
    });
  }


  // To login user using input credentials and return the response
  login(credential) {
    return this.http.post(this.apiBaseUrl + 'users/login', credential)
    .pipe(
      map(res => {
        this.storage.set('userData', res);
        this.userData = res;
        console.log('Hello :' + this.userData);
        console.log('Hello :' + this.userData.id);
        return this.userData;
      })
    );
  }

  // To set valid session token of logged in user and authenticate.
  setToken(token, userId) {
    return this.storage.set(TOKEN_KEY, token).then(() => {
      this.token = token;
      this.userId = userId;
      this.storage.set('UID', userId);
      this.authenticationState.next(true);
    });
  }

  // Logout user by removing token and other details from storage and setting authentication
  // state to false.
  logout() {
    return this.storage.remove(TOKEN_KEY).then(() => {
      this.storage.remove('UID');
      this.storage.remove('userDetails');
      this.authenticationState.next(false);
    });
  }

  // To check if user is authenticated or not.
  isAuthenticated() {
      this.storage.get('userData')
      .then(userData=>{
        if(userData&&userData.id){
          this.userId = userData.userId;
          this.userData = userData;
          console.log(userData);
        }
      });
    return this.authenticationState.value;
  }

  // To retrieve user token from storage
  getUserToken() {
  if(!this.token) {
    this.storage.get(TOKEN_KEY).then(data => {
      this.token = data;
    });
  }
    return this.token;
  }

  // Retrieve userId
  getUserId() {
    return this.userId;
  }

  // Retrieve user details
  getUserData() {
    return this.userData;
  }

  //Update attributes of a user
  patchUser(userForm, userId) {
    return this.http.patch(this.apiBaseUrl + 'users/' + userId, userForm, {responseType: "json"});
  }

}
