import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user/user.service';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { AlertService } from '../../services/alert/alert.service';
import { TripService } from '../../services/trip/trip.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-people',
  templateUrl: './people.page.html',
  styleUrls: ['./people.page.scss'],
})
export class PeoplePage implements OnInit {


  user: any;
  routeId: any;

  friends: any[];
  neighbors: any[] = [];
  inviteRequest: any;

  usersForTrip: any[] = [];
  trip: any;
  noOfTrips: any;

  constructor(
    private userService: UserService, 
    private router: Router,
    private navExtras: NavExtrasService,
    private alertService: AlertService,
    private tripService: TripService,
    private storage: Storage
  ) {

    // Subscribing to user Observable.
    this.navExtras.currentUser.subscribe((user) => {
      this.user = user;
      this.friends = [];
      this.neighbors = [];
      
    });

    // Subscribing to currently selected route Observable.
    this.navExtras.currentSubject.subscribe((route) => {
      this.routeId = route.id;
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadFriends(this.user);
    this.usersForTrip = [];
    // If route is set then add current user to list of users going on trip
    if(this.navExtras.getRouteFlag()) {
      this.usersForTrip.push(this.user.id);
    }     
  }

  ionViewWillLeave() {
    console.log('Left');
    if(this.friends.length > 0 || this.neighbors.length > 0) {
      let slidingItems = document.getElementsByTagName('ion-item-sliding');
      for(let i in slidingItems) {
        slidingItems[0].close();
      }
    }
  }

  loadFriends(user) {
    
    this.userService.getFriends(user.id).subscribe((data) => {
      this.friends = [];
      console.log('Friends: ', data);
      for(let i in data) {
        this.userService.getOtherUser(data[i].friend).subscribe((friend) => {
          console.log('Friends are: ', friend);
          this.friends = this.friends.concat(friend);
        }, (err) => {
          console.log(err);
        });
      }
      this.loadNeighbors(this.user);
    }, (err) => {
      console.log(err);
    });
  }

  loadNeighbors(user) {
    
    this.userService.findUsersByLocality(user.country.name, user.region, user.city).subscribe((data) => {
      this.neighbors = [];
      console.log('Neighbors: ', data);
      console.log('Friends: ', this.friends);
      for(let i in data) {
        // To avoid the user being loaded as a neighbor
        if(data[i].id != this.user.id) {
          console.log(data[i]);
          // To avoid friends being loaded into neighbor list
          let found = false;
          for(let j in this.friends) {
            if(data[i].username == this.friends[j].username) {
              found = true;
            }
          }
          if(!found) {
            console.log(data[i] in this.friends);
            this.neighbors = this.neighbors.concat(data[i]);
          }
        }
      }
    });
  }

  inviteFriend(friend, dom) {
    // To style the ion-item-sliding after pressing an option
    dom.parentNode.parentNode.style.backgroundColor = '#7c9885';
    dom.parentNode.parentNode.style.color = 'white';
    // To close ion-item-sliding
    dom.parentNode.parentNode.close();
    // To disable sliding of ion-item-sliding
    dom.parentNode.parentNode.disabled = true;


    // Trip invites
    if(this.navExtras.getRouteFlag()) {
      console.log('Flag', this.navExtras.getRouteFlag());
      
      if(this.usersForTrip.indexOf(friend.id) == -1) {
        this.usersForTrip.push(friend.id);
      }
      else {
        this.alertService.clientToast('Invitation already sent!');
      }
    }
  }

  inviteNeighbor(neighbor, dom) {
    this.inviteRequest = {
        "friend": neighbor.id,
        "no_of_trips": 0,
        "status": "PENDING",
        "userId": this.user.id
    }
    console.log('Invitation: ', this.inviteRequest);
    // To style the ion-item-sliding after pressing an option
    dom.parentNode.parentNode.style.backgroundColor = '#7c9885';
    dom.parentNode.parentNode.style.color = 'white';
    // To close ion-item-sliding
    dom.parentNode.parentNode.close();
    // To disable sliding of ion-item-sliding
    dom.parentNode.parentNode.disabled = true;
    this.userService.retrieveSpecificFriendship(this.user.id, neighbor.id).subscribe((data) => {
      console.log('Data:', data);

      // If route is set then invitations count as Trip invites, not friend requests
      if(this.navExtras.getRouteFlag()) {
        this.usersForTrip.push(neighbor.id);
      }        

      if(data == '') {
        this.userService.establishFriendship(this.inviteRequest).subscribe((res) => {
          console.log(res);
        }, (err) => {
          console.log(err);
        });
      }
      else {
        this.alertService.clientToast('Invitation already sent!');
      }
    }, (err) => {
      console.log(err);
    });
  }

  sendTripInvites() {
    this.trip = {
      "users": this.usersForTrip,
      "status": "WAITING",
      "userId": this.user.id,
      "routesId": this.routeId
    }
    this.tripService.getTripsByUserId(this.user.id).subscribe((data) => {
      console.log('P 1 STAGE ', this.user.id);
      console.log('data routes, ', data);
      // If an unfinished trip already exists
      if(data != '') {
        // Code to decrement Route trip count by 1
        
        this.tripService.getRouteTripCount(data[0].routesId).subscribe((count) => {
          this.noOfTrips = count;
          console.log('No of Trips: ', this.noOfTrips);
          this.noOfTrips.tripCount = this.noOfTrips.tripCount - 1;
          this.tripService.updateRoute(data[0].routesId, this.noOfTrips).subscribe(() => {
            console.log('Route updated!');
          }, (err) => {
            console.log(err);
          });
        }, (err) => {
          console.log(err);
        });

        // Code to delete previously set unfinished trip
        this.tripService.deleteTrip(data[0].id).subscribe((res) => {
          this.alertService.clientToast('Unfinished trip overwritten!');
          console.log('P 2 STAGE ', data[0].id);
          
          // Code to add trip to Trip model
          this.tripService.addTrip(this.trip).subscribe((trip) => {
            this.trip = trip;
            console.log('P 3 STAGE ', this.trip.id);
            this.storage.set('tripId', this.trip.id);
            this.router.navigateByUrl(`members/lobby`);
            console.log(trip);
          }, (err) => {
            console.log(err);
          });
        }, (err) => {
          console.log(err);
        });
      }
      else {

        // Code to add trip to Trip model
        this.tripService.addTrip(this.trip).subscribe((trip) => {
          this.trip = trip;

          // Code to increment Route trip count by 1
          this.tripService.getRouteTripCount(this.trip.routesId).subscribe((count) => {
            this.noOfTrips = count;
            console.log('No of Trips: ', this.noOfTrips);
            this.noOfTrips.tripCount = this.noOfTrips.tripCount + 1;
            this.tripService.updateRoute(this.trip.routesId, this.noOfTrips).subscribe(() => {
              console.log('Route updated!');
            }, (err) => {
              console.log(err);
            });
          }, (err) => {
            console.log(err);
          });
          console.log('Trip', trip);
          console.log('Trip id', this.trip);
          
          this.storage.set('tripId', this.trip.id);
          this.router.navigateByUrl(`members/lobby`);
          
        }, (err) => {
          console.log(err);
        });
      }
    }, (err) => {
      console.log(err);
    });
  }

}
