import { Component, OnInit } from '@angular/core';

import { TripService } from '../../services/trip/trip.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { AlertService } from '../../services/alert/alert.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { UserService } from '../../services/user/user.service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../../services/authentication/authentication.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.page.html',
  styleUrls: ['./lobby.page.scss'],
})
export class LobbyPage implements OnInit {

  route: any = '';

  currentLocation: any;
  trip: any = '';
  user: any = '';
  userSubscriber: Subscription;
  routeSubscriber: Subscription;
  selectedRouteSubscriber: Subscription;
  // To check if current user is the creator of the trip or not
  creator: boolean = false;

  totalUsersCount: number = 0;
  readyUsersCount: number = 0;
  notReadyUsers: any[] = [];
  notReadyUsersId: any[] = [];
  readyUsers: any[] = [];
  readyUsersId: any[] = [];
  readyFlag: boolean = false;
  alertMessage: string;
  friends: any[] = [];
  friendsId: any[] = [];
  // For user count Progress bar
  userProgress: number = -1;

  start: boolean = false;

  mileage: any;
  totalFuel: any;
  distanceToBeCovered: any;

  tripGeoCoord: any[] = [];

  interval: any;

  constructor(
    private tripService: TripService,
    private alertService: AlertService,
    private navExtras: NavExtrasService,
    private router: Router,
    private userService: UserService,
    private geolocation: Geolocation,
    private storage: Storage,
    private authenticationService: AuthenticationService
  ) { }

  async ngOnInit() {

  let initialUserLength = this.tripGeoCoord.length; 
  // Repeatable task, runs every 5 seconds
  this.interval = setInterval(() => {
    
    if(this.tripGeoCoord.length > 0) {
      let found = false;
      for(let i in this.tripGeoCoord) {
        if(this.user.id == this.tripGeoCoord[i].userId) {
          // Update Geolocation of current existing user
          found = true;
          this.tripGeoCoord[i].location = this.currentLocation;
        }
        console.log('STAGE 3', this.user.id);
      }
      // If Geolocation of current user doesn't exist, add it.
      if(found == false) {
        this.tripGeoCoord.push({
          'userId': this.user.id,
          'location': this.currentLocation
        });
      }
      this.updateGeolocation(this.tripGeoCoord); 
    }

    if((this.friends.length > 0) && (initialUserLength < this.tripGeoCoord.length)) {
      initialUserLength = this.tripGeoCoord.length;
      this.checkIfUsersReady();
    }
  }, 5000);
  
  }

  ionViewWillEnter() {
    this.storage.get('mileage').then((mileage) => {
      this.mileage = mileage;

      this.storage.get('fuel').then((totalFuel) => {
        this.totalFuel = totalFuel;
        this.distanceToBeCovered = this.mileage * this.totalFuel;
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });


    this.storage.get('tripId').then((tripId) => {
      try{
        
        this.navExtras.changeTripFlag(true);
        this.navExtras.setRouteFlag();
        console.log('Trip ID is ', tripId);
        this.tripService.getTripById(tripId).subscribe((trip) => {
          this.trip = trip;

          this.tripService.getRouteForTrip(this.trip.id).subscribe((route) => {
            this.navExtras.setSelectedRouteSubject(route);

            this.routeSubscriber = this.navExtras.selectedRoute.subscribe((route) => {
              this.route = route;
              this.loadUser();
        
              console.log('ROUUTE', this.route);
              console.log('this.trip  ', this.trip);
              
              this.geolocation.getCurrentPosition().then(async (position) => {
                this.currentLocation = {
                  'lat': position.coords.latitude,
                  'lng': position.coords.longitude
                };
          
                console.log('STAGE 3 pre', this.trip.id);
                
                await this.checkIfUsersReady();
                console.log('current pos: ', this.currentLocation);
                let found = false;
                for(let i in this.trip.geoCoord) {
                  if(this.user.id == this.trip.geoCoord[i].userId) {
                    // Update Geolocation of current existing user
                    found = true;
                    this.trip.geoCoord[i].location = this.currentLocation;
                  }
                  console.log('STAGE 3', this.user.id);
                }
                // If Geolocation of current user doesn't exist, add it.
                if(found == false) {
                  this.trip.geoCoord.push({
                    'userId': this.user.id,
                    'location': this.currentLocation
                  });
                }
                this.tripGeoCoord = this.trip.geoCoord;
                this.updateGeolocation(this.trip.geoCoord);
              }, (err) => {
                console.log(err);
              });
            }, (err) => {
              console.log(err);
            });
          }, (err) => {
            console.log(err);
          });

        }, (err) => {
          console.log(err);
          this.storage.get('UID').then((userId) => {
            this.storage.remove(userId).then(() => {
            this.router.navigateByUrl('members/tabs/dashboard');
            });
          });

        });
      }catch(e) {
        console.log('2nd Error: ', e);
      }
    }, (err) => {
      console.log(err);
    });
  }


  ionViewWillLeave() {
    this.userSubscriber.unsubscribe();
    this.routeSubscriber.unsubscribe();
    this.selectedRouteSubscriber.unsubscribe();
    clearInterval(this.interval);
  }


  loadUser() {
    this.storage.get('UID').then((userId) => {
      this.userService.getUserData(userId).subscribe((data) => {
        console.log(data);
        this.userSubscriber = this.navExtras.currentUser.subscribe((user) => {
          this.user = user;

          // Assume both route and trip has been set.
          this.storage.set(this.user.id, this.user.id);

          if(this.trip == '') {
            console.log('To check of companion removal works: ', this.trip);
            this.storage.remove(userId).then(() => {
              this.router.navigateByUrl('members/tabs/dashboard');
            });
          }

          console.log('STAGE 4', this.user);
          console.log('STAGE 4', this.user.id);
          this.loadTripCompanions();
        }, (err) => {
          console.log(err);
        });
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
  }


  loadTripCompanions() {
    console.log('Users are: ', this.trip.users);
    for(let i in this.trip.users) {
      console.log('Testing a user: ', this.trip.users[i]);
      this.userService.getOtherUser(this.trip.users[i]).subscribe((user) => {
        console.log('Friend is: ', user);
        let userData: any = user;
  
        if(userData.id != this.user.id) {
          // this.friends = this.friends.concat(userData);
          this.friends.push(userData);
          this.friendsId.push(userData.id);
        }
      }, (err) => {
        console.log(err);
      });
    }
    console.log('Friends are: ', this.friends);
  }


  updateGeolocation(tripGeoData) {
    this.tripService.updateTrip(this.trip.id, {'geoCoord': tripGeoData}).subscribe((updatedTrip) => {
      console.log('Updated Trip: ', updatedTrip);
    }, (err) => {
      console.log(err);
    });
  }


  checkIfUsersReady() {
    return new Promise((resolve, reject) => {
      this.selectedRouteSubscriber = this.navExtras.selectedRoute.subscribe(() => {
        this.readyUsers = [];
        for(let i in this.trip.geoCoord) {
          if(this.user.id != this.trip.geoCoord[i].userId) {
            // this.readyUsers = this.readyUsers.concat(this.trip.geoCoord[i].userId);
            this.readyUsersId.push(this.trip.geoCoord[i].userId);
            this.userService.getOtherUser(this.trip.geoCoord[i].userId).subscribe((user) => {
              this.readyUsers.push(user);
            }, (err) => {
              console.log(err);
            });
          }
        }
        console.log('Ready Users', this.readyUsers);
        // Check if current user is creator of trip
        if(this.user.id == this.trip.userId) {
          this.creator = true;
        }
        else {
          this.creator = false;
        }
        console.log('STAGE 6', this.readyUsers);
        // Set difference, A - B
        this.notReadyUsersId = this.friendsId.filter(x => !this.readyUsersId.includes(x));
        console.log('Not Ready Users Id: ', this.notReadyUsersId);
        this.notReadyUsers = [];
        
        // Possible problem with the for loop repeating the first name twice
        for(let i in this.notReadyUsersId) {
          this.userService.getOtherUser(this.notReadyUsersId[i]).subscribe((user) => {
            console.log('NotReady User test id: ', i);
            console.log('NotReady User test id: ', user);
            this.notReadyUsers.push(user);
            // To remove duplicates in the list
            this.notReadyUsers = this.notReadyUsers.filter(this.onlyUnique);

          }, (err) => {
            console.log(err);
          });
        }
        // To remove duplicates in the list
        this.notReadyUsers = this.notReadyUsers.filter(this.onlyUnique);
        console.log('Not READY USERS, ', this.notReadyUsers);
        console.log('Trip users length: ', this.trip.users.length);
        this.totalUsersCount = this.trip.users.length;
        this.readyUsersCount = this.trip.geoCoord.length;
        this.userProgress = this.readyUsersCount / this.totalUsersCount;
        if(this.readyUsersCount == this.totalUsersCount) {
          this.alertMessage = 'All users ready! Start your trip?'
          if(!this.creator) {
            //
          }
        }
        else {
          this.alertMessage = `${this.totalUsersCount - this.readyUsersCount} companions are not ready! Do you still want to start?`
        }
        setTimeout(() => {
          // To remove duplicates in the list
          this.notReadyUsers = this.notReadyUsers.filter(this.onlyUnique);
          resolve();
        }, 600);  

      }, (err) => {
        console.log(err);
      });
    });

  }

  startTrip() {
    if(this.creator) {
      this.alertService.confirmAlert(
        'One last step...',
        this.alertMessage,
        'Start',
        () => {
          // Start trip
          this.readyFlag = true;
          console.log('Update trip id is ', this.trip.id);
          this.tripService.updateTrip(this.trip.id, {'status': 'ONGOING'}).subscribe((res) => {
            this.router.navigateByUrl('members/enroute');
          }, (err) => {
            console.log(err);
          });
        },
        'Wait',
        () => {
          // Do not start
          this.readyFlag = false;
          this.notReadyUsers = [];
          this.notReadyUsersId = [];
          this.readyUsers = [];
          this.readyUsersId = [];
          this.friends = [];
          this.friendsId = [];
          this.ionViewWillEnter();
        }
      );
    }
    else {
      this.readyFlag = true;
    }
  }

  // To return only unique elements from a list
  onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }

  cancelTrip() {

    this.alertService.confirmAlert(
      'Cancel your trip?',
      'Do you really want to leave the trip? You cannot return to it at a later point in time.',
      'Yes',
      () => {
        // Exit from trip
        this.storage.remove(this.user.id).then(() => {
          // Find the index position of "userId," then remove one element from that position
          console.log(console.log('Creator? ', this.creator));
          if(this.creator) {
            this.tripService.deleteTrip(this.trip.id).subscribe((res) => {
              console.log('Trip deleted.');
            }, (err) => {
              console.log(err);
            });
          }
          else {
            this.trip.users.splice(this.trip.users.indexOf(this.user.id), 1);

            for(let i=0; i < this.trip.geoCoord.length; i++) {
              if(this.user.id == this.trip.geoCoord[i].userId) {
                console.log('Geocoord i is ', this.trip.geoCoord[i]);
                this.trip.geoCoord.splice(i, 1);
              }
            }
            let update = {
              'users': this.trip.users,
              'geoCoord': this.trip.geoCoord
            }
            console.log('Update is ', update);
            this.tripService.updateTrip(this.trip.id, update).subscribe((updatedTrip) => {
              console.log('Updated Trip: ', updatedTrip);
            }, (err) => {
              console.log(err);
            });
          }
          
          this.router.navigateByUrl('members/tabs/dashboard');
        }).catch(() => {
          console.log('Error!!!');
        });
      },
      'No',
      () => {
        // Do not exit
        console.log('Not exiting!');
      }
    );
  }

  logout() {
    this.userSubscriber.unsubscribe();
    this.routeSubscriber.unsubscribe();
    this.selectedRouteSubscriber.unsubscribe();
    clearInterval(this.interval);

    this.authenticationService.logout();
    this.alertService.clientToast("You have been successfully logged out.");
  }

}
