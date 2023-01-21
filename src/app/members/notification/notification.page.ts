import { Component, OnInit, ViewChild } from '@angular/core';

import { UserService } from '../../services/user/user.service';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { AlertService } from '../../services/alert/alert.service';
import { NotificationService } from '../../services/notification/notification.service';
import { TripService } from '../../services/trip/trip.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { IonList } from '@ionic/angular';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {

  @ViewChild('slidingList') slidingList: IonList;

  user: any;
  friends: any[] = [];
  notificationCount: number = 0;

  constructor(
    private userService: UserService, 
    private navExtras: NavExtrasService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private tripService: TripService,
    private router: Router,
    private storage: Storage
  ) {
    this.navExtras.currentUser.subscribe((user) => {
      this.user = user;
    }, (err) => {
      console.log(err);
    });
  }
  ngOnInit() {
  }

  ionViewWillEnter() {
    // Assume Notifications are read and hide notification badge
    this.notificationService.notificationCount = 0;

    // Load all requests
    this.checkInvitations();
  }

  ionViewWillLeave() {
    if(this.friends.length > 0) {
      let slidingItems = document.getElementsByTagName('ion-item-sliding');
      for(let i in slidingItems) {
        slidingItems[0].close();
      }
    }
  }

  checkInvitations() {
    this.userService.getInvitations(this.user.id).subscribe((data) => {

      // Resetting friends list and notification count before refresh
      this.friends = [];
      this.notificationCount = 0;

      console.log(data);
      if(data != '') {
        // Load each friend user if they have made a request or an invite
        for(let i in data) {
          this.notificationCount++;
          this.userService.getOtherUser(data[i].userId).subscribe((friend) => {
            console.log('Friends are: ', friend);
            this.friends = this.friends.concat(friend);
          }, (err) => {
            console.log(err);
          });
        }
      }
    }, (err) => {
      console.log(err);
    });
  }

  rejectInvite(friend) {

    this.slidingList.closeSlidingItems();

    this.userService.retrieveSpecificFriendship(friend.id, this.user.id).subscribe((data) => {
      this.alertService.clientToast('Invitation Declined.');
      console.log(data[0].id);
      if(data[0].status == 'PENDING') {
        this.userService.removeFriendship(data[0].id).subscribe((res) => {
          this.friends = [];
          this.checkInvitations();
          console.log(res);
        });
      }


      // If friend was inviting for a trip and not just a friend request, remove from model instance
      this.tripService.getTripsByUserId(friend.id).subscribe((trip) => {
        if(trip != '') {
          console.log('Trip users: ', trip[0].users);
          for(let i in trip[0].users) {
            console.log(trip[0].users[i]);
            if(this.user.id == trip[0].users[i]) {
              // Find the index position of "userId," then remove one element from that position
              trip[0].users.splice(trip[0].users.indexOf(this.user.id), 1);
              this.userService.updateFriendship(friend.id, data[0].id, {'users': trip[0].users}).subscribe((res) => {
                console.log('User deleted from trip');
              }, (err) => {
                console.log(err);
              });
            }
          }
        }
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
  }

  acceptInvite(friend) {

    this.slidingList.closeSlidingItems();

    this.userService.retrieveSpecificFriendship(friend.id, this.user.id).subscribe((data) => {
      this.alertService.clientToast('Invitation Accepted.');
      console.log(data);
      if(data[0].status == 'PENDING') {
        console.log('Id:  ', data[0].id);

        // Update PENDING to FRIEND
        this.userService.updateFriendship(friend.id, data[0].id, {"status": "FRIEND"}).subscribe((res) => {
          console.log('After update: ', res);

          let newFriend = {
            "friend": friend.id,
            "no_of_trips": 0,
            "status": "FRIEND",
            "userId": this.user.id          
          }

          // Create new entry for current user as userId and invitee as friend
          this.userService.establishFriendship(newFriend).subscribe((res) => {
            console.log(res);
            this.friends = [];
            this.checkInvitations();
          }, (err) => {
            console.log(err);
          });

        }, (err) => {
          console.log(err);
        });
        
      }

      // If friend was inviting for a trip and not just a friend request
      this.tripService.getTripsByUserId(friend.id).subscribe((trip) => {
        if(trip != '') {
          console.log('Trip users: ', trip[0].users);
          for(let i in trip[0].users) {
            console.log(trip[0].users[i]);
            if(this.user.id == trip[0].users[i]) {
              
              this.storage.set('tripSetFlag', true).then(() => {
                this.navExtras.changeTripFlag(true);
                
                this.storage.set('tripId', trip[0].id).then(() => {
                  this.router.navigateByUrl(`members/lobby`);
                }, (err) => {
                  console.log(err);
                });
                
              }, (err) => {
                console.log(err);
              });
            }
          }
        }
      }, (err) => {
        console.log(err);
      });

    }, (err) => {
      console.log(err);
    });
  }

  doRefresh(event) {
    console.log('Begin async operation, refresh');
    this.ionViewWillEnter();

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

}
