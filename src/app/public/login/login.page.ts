import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from'@angular/forms';

import { AuthenticationService } from '../../services/authentication/authentication.service';
import { Observable } from 'rxjs';
import { AlertService } from '../../services/alert/alert.service';
import { Router, Route } from '@angular/router';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  subscription: Subscription;

  loginForm: FormGroup;
  credential: any;
  userId: string;
  private userObservable : Observable<any>; 

  // unamePattern is valid for both username or email
  unamePattern = '^(?:[a-zA-Z][a-zA-Z\d_-]{5,29}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$';
  pwdPattern = '^[a-zA-Z0-9@*!$%=_# ]{5,29}$';

  error_messages = {
    'username': [
      { type: 'required', message: 'Username is required.'},
      { type: 'pattern', message: 'Please enter a valid username between length of 6-30.'}
    ],
    'password': [
      { type: 'required', message: 'Password is required.'},
      { type: 'pattern', message: 'Please enter a valid password between length of 6-30.'}
    ],
  }

  constructor(
    public authenticationService: AuthenticationService, 
    public formBuilder: FormBuilder, 
    public alertService: AlertService,
    public router: Router,
    private platform: Platform,
    private geolocation: Geolocation
  ) {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.unamePattern) 
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.pwdPattern)
      ]))
    });
  }

  ngOnInit() {
    this.geolocation.getCurrentPosition().then(() => {
      console.log('Stub for obtaining permission');
    }).catch(() => {
      console.log('Failed');
    });
  }

  login() {
    console.log("username: " + this.loginForm.value.username);
    console.log("password: " + this.loginForm.value.password);

    // Test if input matches the regex pattern for username
    if(/^(?:[a-zA-Z][a-zA-Z\d_-]{5,29})$/.test(this.loginForm.value.username)) {
      this.credential = {
        "username": this.loginForm.value.username,
        "password": this.loginForm.value.password
      }
    }
    // Else it is an email address
    else {
      this.credential = {
        "email": this.loginForm.value.username,
        "password": this.loginForm.value.password
      }
    }


    this.userObservable = this.authenticationService.login(this.credential);
    this.userObservable.subscribe(res => {
      console.log(res);
      this.authenticationService.setToken(res.id, res.userId);
      this.userId = res.userId;
      console.log(this.userId);
    }, err => {
      this.alertService.clientToast("Invalid username/password!")
      console.log(err);
    });

  }

  ionViewWillEnter() {
    // To exit app upon pressing hardware back button
    this.subscription = this.platform.backButton.subscribe(()=>{
      navigator['app'].exitApp();
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  register() {
    this.router.navigateByUrl('/register');
  }
}
