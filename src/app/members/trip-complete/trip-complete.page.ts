import { Component, OnInit } from '@angular/core';

import { TripService } from '../../services/trip/trip.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { AlertService } from '../../services/alert/alert.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-trip-complete',
  templateUrl: './trip-complete.page.html',
  styleUrls: ['./trip-complete.page.scss'],
})
export class TripCompletePage implements OnInit {

  user: any;
  route: any;
  trip: any;
  progress: any;

  totalDistance: number;
  avgSpeed: number;

  // Rating given by user once he/she has finished the trip.
  newRouteRate: number = 0;

  constructor(
    private storage: Storage,
    private router: Router,
    private navExtras: NavExtrasService,
    private alertService: AlertService,
    private userService: UserService,
    private tripService: TripService
  ) {

    this.navExtras.currentUser.subscribe((user) => {
      this.user = user;
    }, (err) => {
      console.log(err);
    });

    this.navExtras.selectedRoute.subscribe((route) => {
      this.route = route;
    });

    this.storage.get('distanceCovered').then((distanceCovered) => {
      this.totalDistance = distanceCovered;
    }).catch(() => {
      console.log('Error retrieving distanceCovered.');
    });

    this.storage.get('avgSpeed').then((avgSpeed) => {
      this.avgSpeed = avgSpeed;
    }).catch(() => {
      console.log('Error retrieving avgSpeed');
    });

    // To update no_of_trip count in friendship instance
    this.storage.get('tripId').then((tripId) => {
      this.tripService.getTripById(tripId).subscribe((trip) => {
        console.log(trip);
        this.trip = trip;
        if(this.trip != '') {
          for(let i in trip[0].users) {
            let friendship;
            console.log(trip[0].users[i]);
            if(this.user.id != trip[0].users[i]) {
              this.userService.retrieveSpecificFriendship(this.user.id, trip[0].users[i]).subscribe((friend) => {
                friendship = friend;
                this.userService.updateFriendship(this.user.id, trip[0].users[i],
                   {'no_of_trips': friendship.no_of_trips + 1}).subscribe((res) => {
                  console.log(res);
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

  ngOnInit() {
  }

  ionViewWillEnter() {

  }

  onRateChange(event) {
    let totalRating = 0;
    let update;
    let rating
    let voteCount = 0;
    console.log('Rating by user: ', this.newRouteRate);

    this.tripService.getRouteRating(this.route.id).subscribe((routeRating) => {
      rating = routeRating;
      // If route has not been rated yet
      if(rating == '') {
        if(this.newRouteRate == 5) {
          update = {'fiveStar': 1};
        }
        else if(this.newRouteRate == 4) {
          update = {'fourStar': 1};
        }
        else if(this.newRouteRate == 3) {
          update = {'threeStar': 1};
        }
        else if(this.newRouteRate == 2) {
          update = {'twoStar': 1};
        }
        else {
          update = {'oneStar': 1};
        }

        this.tripService.addRouteRating(this.route.id, update).subscribe((rating) => {
          console.log('New Rating Added.');
        }, (err) => {
          console.log(err);
        });
      }
      // If rating exists for the route
      else {

        if(this.newRouteRate == 5) {
          update = {'fiveStar': rating.fiveStar + 1};
        }
        else if(this.newRouteRate == 4) {
          update = {'fourStar': rating.fourStar + 1};
        }
        else if(this.newRouteRate == 3) {
          update = {'threeStar': rating.threeStar + 1};
        }
        else if(this.newRouteRate == 2) {
          update = {'twoStar': rating.twoStar + 1};
        }
        else {
          update = {'oneStar': rating.oneStar + 1};
        }

        // Update rating in the rating instance
        this.tripService.updateRouteRating(this.route.id, update).subscribe((upRating) => {
          rating = upRating;
          // Use weighted average: (5*252 + 4*124 + 3*40 + 2*29 + 1*33) / (252+124+40+29+33) = 4.11
          if(rating.fiveStar > 0) {
            totalRating += rating.fiveStar * 5;
            voteCount += rating.fiveStar;
          }
          if(rating.fourStar > 0) {
            totalRating += rating.fourStar * 4;
            voteCount += rating.fourStar;
          }
          if(rating.threeStar > 0) {
            totalRating += rating.threeStar * 3;
            voteCount += rating.threeStar;
          }
          if(rating.twoStar > 0) {
            totalRating += rating.twoStar * 2;
            voteCount += rating.twoStar;
          }
          if(rating.oneStar > 0) {
            totalRating += rating.oneStar * 1;
            voteCount += rating.oneStar;
          }

          let finalRating = Math.ceil(Math.round(totalRating/voteCount));

          // Update rating in the route instance
          this.tripService.updateRoute(this.route.id, {'rating': finalRating}).subscribe((upRoute) => {
            console.log('Route rating updated');
          }, (err) => {
            console.log(err);
          });
        }, (err) => {
          console.log(err);
        });

      }
    }, (err) => {
      console.log(err);
    });
  }

  finish() {
    // Remove flag that lets you enter the lobby
    this.storage.remove(this.user.id).then((flag)=>{
      console.log('Deleted the User Flag');
      this.router.navigateByUrl('members/tabs/dashboard');
    }).catch(() => {
      console.log('User flag not found! Error finishing trip.');
    });
  }

}
