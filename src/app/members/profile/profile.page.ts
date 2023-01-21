import { Component, OnInit } from '@angular/core';

import { Storage } from '@ionic/storage';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from '../../components/popover-menu/popover-menu.component';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { UserService } from '../../services/user/user.service';
import * as env from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

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

  userDetails: any;
  progress: any;
  update: boolean = false;

  constructor(
    public popoverController: PopoverController, 
    public modalController: ModalController,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage,
    private navExtras: NavExtrasService,
    private userService: UserService
  ) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    this.update = (this.route.snapshot.paramMap.get('update') === "true");
    if(this.update) {
      this.userDetails = null;
      this.update = false;
    }
    this.initializeProfile();
  }

  initializeProfile() {
    
    this.navExtras.currentUser.subscribe((user) => {
      this.userDetails = user;
      //To reverse date of birth format
      this.userDetails.dateofbirth = this.reverseString(this.userDetails.dateofbirth);
      //To add spacing between first, middle and last names
      if(this.userDetails.middlename == '') {
        this.userDetails.middlename = ' ';
      }
      else {
        this.userDetails.middlename = ' ' + this.userDetails.middlename + ' ';
      }

      // To get current level and experience of user
      this.userService.getUserProgress(this.userDetails.id).subscribe((progress) => {
        this.progress = progress;
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverMenuComponent,
      event: ev,
      translucent: true,
      animated: true,
    });
    return await popover.present();
  }

  // To reverse date format yyyy mm dd to dd mm yyyy
  reverseString(str) {
    return str.split(" ").reverse().join("/");
  }

  editProfile() {
    this.router.navigate(['members/edit-profile']);
  }

}
