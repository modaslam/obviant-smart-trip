import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  // public appPages = [
  //   {
  //     title: 'Dashboard',
  //     url: '/members/dashboard',
  //     icon: 'home'
  //   },
  //   {
  //     title: 'Profile',
  //     url: '/members/profile',
  //     icon: 'list'
  //   }
  // ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      
      this.authenticationService.authenticationState.subscribe(state => {
        if (state) {
          this.router.navigate(['members/tabs/dashboard']);
        } else {
          this.router.navigate(['login']);
        }
      });
    });
  }

  logout() {
    this.authenticationService.logout();
  }
  
}
