import { Component, OnInit, ViewChild } from '@angular/core';

import { AlertService } from '../../services/alert/alert.service';
import { IonInfiniteScroll } from '@ionic/angular';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
})
export class LeaderboardPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  page: any;
  users: any;
  moreUsers: any[];

  constructor(
    private navExtras: NavExtrasService,
    private router: Router,
    private alertService: AlertService,
    private userService: UserService
  ) {
    this.page = {
      'limit': 20,
      'skip': 0
    }
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadMoreUsers(null);
  }


  loadMoreUsers(event) {
    if(event == null) {
      this.page = {
        'limit': 5,
        'skip': 0
      }
      this.moreUsers = [];
    }
    else {
      this.page.limit += 5;
      this.page.skip += 5;
    }
    this.userService.getAllProgress(this.page).subscribe((progress) => {
      let userProgress;
      let currentUser;
      console.log(progress);
      for(let i in progress) {
        userProgress = progress;
        this.userService.getOtherUser(progress[i].userId).subscribe((user) => {
          currentUser = user;
          currentUser.exp = progress[i].experience;
          this.moreUsers.push(currentUser);
          console.log(this.moreUsers);
        }, (err) => {
          console.log(err);
        });
      }

      if(event != null) {
        event.target.complete();
      }

      if(Object.keys(progress).length < 20) {
        if(event == null) {
          this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
        }
        else {
          event.target.disabled = true;
        }
        this.alertService.clientToast('No more users!');
      }
    }, (err) => {
      console.log(err);
    });    
  }

}
