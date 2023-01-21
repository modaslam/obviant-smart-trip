import { Component, OnInit } from '@angular/core';

import { AuthenticationService } from '../../services/authentication/authentication.service';
import { AlertService } from '../../services/alert/alert.service';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss']
})
export class PopoverMenuComponent implements OnInit {

  public appPages = [
    {
      title: 'Dashboard',
      url: '/members/tabs/dashboard',
      icon: 'home'
    },
    {
      title: 'Profile',
      url: '/members/tabs/profile',
      icon: 'list'
    }
  ];

  constructor(
    private authenticationService: AuthenticationService,
    private popoverController: PopoverController,
    public alertService: AlertService
  ) { }

  ngOnInit() {
  }

  logout() {
    this.authenticationService.logout();
    this.alertService.clientToast("You have been successfully logged out.");
    this.popoverController.dismiss();
  }

  closePopover() {
    this.popoverController.dismiss();
  }

}
