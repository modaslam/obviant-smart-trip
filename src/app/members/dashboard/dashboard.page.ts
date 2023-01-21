import { Component, OnInit } from '@angular/core';

import { Storage } from '@ionic/storage';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { UserService } from '../../services/user/user.service';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../../components/popover-menu/popover-menu.component';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  subscription: Subscription;

  userId: string = '';
  token:string = '';
  private userData;
  private username: string;
  private firstname: string;
  private middlename: string;
  private lastname: string;
  private userDetails;

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
    private storage: Storage,
    private authentication: AuthenticationService, 
    private user: UserService,
    private navExtras: NavExtrasService,
    private router: Router,
    public popoverController: PopoverController,
    private platform: Platform
    ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.userData = this.authentication.getUserData();
    console.log("Hey, user: " + this.userData.id);
    this.getUserDetails();

    // To exit app upon pressing hardware back button
    this.subscription = this.platform.backButton.subscribe(()=>{
      navigator['app'].exitApp();
    });
  }

  ionViewWillLeave() {
    this.subscription.unsubscribe();
  }

  getUserDetails() {
    console.log(this.userData);
    this.storage.get("userDetails")
    .then(user=>{
      if(user&&user.id){
        this.userDetails = user;
        console.log(user);
        this.username = this.userDetails.username;
        this.firstname = this.userDetails.firstname;
        this.middlename = this.userDetails.middlename;
        this.lastname = this.userDetails.lastname;
        console.log("newHeyssss: " + this.userDetails);
        console.log("newHey: " + this.userDetails.lastname);
        this.navExtras.setUserSubject(this.userDetails);
      }
      else {
        console.log("Trying");
        this.user.getUserData(this.userData.userId).subscribe((data) => {
          this.userDetails = data;
          this.username = this.userDetails.username;
          this.firstname = this.userDetails.firstname;
          this.middlename = this.userDetails.middlename;
          this.lastname = this.userDetails.lastname;
          console.log("Heyssss: " + this.userDetails);
          console.log("Hey: " + this.userDetails.username);
          this.storage.set("userDetails", this.userDetails);
          
        });
      }

      // TO go to lobby page or not
      this.storage.get('UID').then((userId) => {

        // Use after resetting a trip, remove the below command otherwise
        // this.storage.remove(userId).then((flag)=>{
        //   console.log('Deleted the User Flag');
        // });

        this.storage.get(userId).then((userFlag) => {
          console.log('User Flag is ', userFlag);
          if(userFlag == userId) {
            this.router.navigateByUrl('members/lobby');
          }
              
        }).catch(() => {
          console.log('No User Flag!');
        });
      });
    });    
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverMenuComponent,
      event: ev,
      translucent: false,
    });
    return await popover.present();
  }
}
