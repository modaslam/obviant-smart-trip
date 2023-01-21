import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { TripService } from '../../services/trip/trip.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { AlertService } from '../../services/alert/alert.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Subscription } from 'rxjs';
import { GoogleService } from '../../services/google/google.service';
import { DeviceMotion, DeviceMotionAccelerationData } from '@ionic-native/device-motion/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment,
  Encoding,
  LatLng,
  Spherical,
  Geocoder,
  GeocoderRequest,
  GeocoderResult,
  Polyline,
  CircleOptions,
  Circle,
  ILatLng
} from '@ionic-native/google-maps';



declare var google;

@Component({
  selector: 'app-enroute',
  templateUrl: './enroute.page.html',
  styleUrls: ['./enroute.page.scss'],
})
export class EnroutePage implements OnInit {

  map: GoogleMap;
  route: any;
  sourceMarker: Marker;
  destinationMarker: Marker;
  waypointMarkers: any[] = [];
  // Default zoom for route shown on map
  zoomLevel: number = 8;
  mapLoaded: boolean = false;

  titleName: string = 'Lobby';

  currentLocation: any;
  prevLocation: any;

  trip: any;
  user: any = '';
  // For pinpointing user and companions
  userMarkers: any[] = [];
  // For referring the current user's marker
  userMarkerIndex: number;

  // To check if current user is the creator of the trip or not
  creator: boolean = false;

  readyFlag: boolean = false;

  totalUsersCount: number = 0;
  readyUsersCount: number = 0;
  notReadyUsers: any[] = [];
  readyUsers: any[] = [];

  userMarkerSet: boolean = false;
  alertMessage: string;
  friends: any[] = [];
  // For user count Progress bar
  userProgress: number = -1;

  start: boolean = false;

  mileage: any;
  totalFuel: any;
  distanceToBeCovered: any = 0;

  tripGeoCoord: any[] = [];

  // For periodic geocode updation
  interval: any;

  userCoord: any;

  // Total distance covered by the user
  totalCoveredDistance: number = 0;
  distanceInterval: any;

  // For calculating speed
  totalSpeed = {
    'total': 0,
    'dividedBy': 0
  }
  avgSpeed: number = 0;
  speedInterval: any;

  routeSubscriber: Subscription;
  userSubscriber: Subscription;

  // For checking if user has finished the trip or not
  tripInterval: any;

  // Used in finding nearby fuel station
  fuelStation: any;
  fuelStationRoute: any;
  fuelMarker: Marker;
  circle: Circle;

  constructor(
    private platform: Platform, 
    private tripService: TripService,
    private alertService: AlertService,
    private navExtras: NavExtrasService,
    private router: Router,
    private geolocation: Geolocation,
    public googleService: GoogleService,
    private storage: Storage,
    private deviceMotion: DeviceMotion
  ) { }

  async ngOnInit() {
    try{
    await this.platform.ready();
    this.storage.get('tripId').then((tripId) => {
      this.loadUser();
      this.tripService.getTripById(tripId).subscribe((trip) => {
        console.log(trip);
        this.trip = trip;
        if(this.trip == '') {
          this.storage.remove('lobbyFlag').then(() => {
            this.router.navigateByUrl('members/tab/dashboard');
          });
        }


      // Repeatable task, runs every 5 seconds
      this.interval = setInterval(() => { 
        this.geolocation.getCurrentPosition().then((position) => {
          if(this.currentLocation != undefined) {
            this.prevLocation = this.currentLocation;
          }
          this.currentLocation = {
            'lat': position.coords.latitude,
            'lng': position.coords.longitude
          };
    
          console.log('STAGE 3 pre', this.trip.id);
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

          setTimeout(() => {
            this.addUserMarkers();
            this.addCircle();
          }, 500);

        }, (err) => {
          console.log(err);
        });

        if(this.tripGeoCoord.length > 0) {
          let found = false;
          for(let i in this.tripGeoCoord) {
            if(this.user.id == this.tripGeoCoord[i].userId) {
              // Update Geolocation of current existing user
              found = true;
              this.tripGeoCoord[i].location = this.currentLocation;

              this.userCoord = this.tripGeoCoord[i].location;
            }
            console.log('STAGE 3', this.user.id);
          }
          // If Geolocation of current user doesn't exist, add it.
          if(found == false) {
            this.tripGeoCoord.push({
              'userId': this.user.id,
              'location': this.currentLocation
            });
            this.userCoord = this.currentLocation;
          }
          this.updateGeolocation(this.tripGeoCoord); 
        }
        
      }, 5000);

      this.routeSubscriber = this.navExtras.selectedRoute.subscribe((route) => {
        if(this.readyFlag) {
          this.map.clear();
        }
        
        this.mapLoaded = false;
        this.waypointMarkers = [];
        this.route = route;
        console.log('Enroute to ', this.route);
        console.log(this.route);
        if(this.route.distance > 94) {
          this.zoomLevel = 8;
        }
        else if(this.route.distance > 60) {
          this.zoomLevel = 9;
        }
        else if(this.route.distance > 30) {
          this.zoomLevel = 10;
        }
        else if(this.route.distance > 15) {
          this.zoomLevel = 12;
        }
        else {
          this.zoomLevel = 15;
        }
        let midCoords = Math.floor(this.route.latlngPolyline.length / 2);
        console.log('Middle coordinates: ',midCoords);
        this.loadMap(this.route.latlngPolyline[midCoords].lat, this.route.latlngPolyline[midCoords].lng);
        console.log('STAGE 1');
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
    });
  }catch(e) {
    console.log(e);
  }
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

    // Retrieving the distance covered thus far.
    this.storage.get('distanceCovered').then((distance) => {
      this.totalCoveredDistance = distance;
    }).catch(() => {
      this.totalCoveredDistance = 0;
    });

    this.storage.get('totalSpeed').then((speed) => {
      this.totalSpeed = speed;
    }).catch(() => {
      this.totalSpeed = {
        'total': 0,
        'dividedBy': 0
      }
    });

    // Calculate speed every 5 seconds
    this.speedInterval = setInterval(() => {
      this.speedCalculation();
    }, 5000)

    // Check if user has reached destination every 8 seconds
    this.tripInterval = setInterval(() => {
      this.tripComplete();
    }, 8000);
  }

  ionViewWillLeave() {
    this.routeSubscriber.unsubscribe();
    this.userSubscriber.unsubscribe();
    clearInterval(this.interval);
    
    // Saving the distance covered thus far
    this.storage.set('distanceCovered', this.totalCoveredDistance).then(() => {
      clearInterval(this.distanceInterval);
    });

    // Saving the speed thus far
    this.storage.set('totalSpeed', this.totalSpeed).then(() => {
      clearInterval(this.speedInterval);
    });
  }

  async loadMap(latitude, longitude) {
    this.readyFlag = true;
    let mapOptions: GoogleMapOptions = {
      enableHighAccuracy: true,
      'controls': {
        'compass': true,
        'myLocationButton': true,
      },
      'gestures': {
        'scroll': true,
        'tilt': true,
        'rotate': true,
        'zoom': true
      },
      camera: {
         target: {
           lat: latitude,
           lng: longitude
         },
         zoom: this.zoomLevel,
         tilt: 30
      },
      'mapType': 'MAP_TYPE_ROADMAP'
    };

    this.map = GoogleMaps.create('enroute_canvas', mapOptions); 

    this.sourceMarker = this.map.addMarkerSync({
      title: this.route.waypoints[0],
      // icon: 'blue',
      icon: '../../../assets/icon/source-flag.png',
      animation: 'DROP',
      position: {
        lat: this.route.latlngPolyline[0].lat,
        lng: this.route.latlngPolyline[0].lng
      }
    });

    this.sourceMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      console.log("Marker clicked");
      if(this.sourceMarker.isInfoWindowShown()) {
        this.sourceMarker.hideInfoWindow();
      }
      else {
        this.sourceMarker.showInfoWindow();
      }
        // alert('clicked');
    });

    this.destinationMarker = this.map.addMarkerSync({
      title: this.route.waypoints[this.route.waypoints.length - 1],
      animation: 'DROP',
      icon: '../../../assets/icon/destination-flag.png',
      position: this.route.latlngPolyline[this.route.latlngPolyline.length - 1]
    });

    this.destinationMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      if(this.destinationMarker.isInfoWindowShown()) {
        this.destinationMarker.hideInfoWindow();
      }
      else {
        this.destinationMarker.showInfoWindow();
      }
    });

    console.log('Waypoints: ', this.route.waypoints);
    for(let i = 1; i < (this.route.waypoints.length - 1); i++) {
      console.log('Working!', this.route.waypoints);
      this.waypointMarkers.push(this.map.addMarkerSync({
        title: this.route.waypoints[i],
        animation: 'DROP',
        icon: '../../../assets/icon/waypoint-marker.png',
        position: this.route.legs[i-1].end_location
      }).on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
         // last is the last waypoint to be added.
        let last = this.waypointMarkers.length - 1;
        if(this.waypointMarkers[last].isInfoWindowShown()) {
          this.waypointMarkers[last].hideInfoWindow();
        }
        else {
          this.waypointMarkers[last].showInfoWindow();
        }
      }));
    }

    let polylinePoints = GoogleMaps.getPlugin().geometry.encoding.decodePath(this.route.overviewPolyline, 5);
    this.map.addPolyline({
      points: polylinePoints,
      color: '#4f345a',
      width: 5,
      geodesic: true,
      clickable: true
    });
    this.mapLoaded = true;
  }


  loadUser() {
    this.userSubscriber = this.navExtras.currentUser.subscribe((user) => {
      this.user = user;
      console.log('STAGE 4', this.user);
      console.log('STAGE 4', this.user.id);
    }, (err) => {
      console.log(err);
    });
  }

  updateGeolocation(tripGeoData) {
    this.tripService.updateTrip(this.trip.id, {'geoCoord': tripGeoData}).subscribe((updatedTrip) => {
      console.log('Updated Trip: ', updatedTrip);
    }, (err) => {
      console.log(err);
    });
  }

  addUserMarkers() {
    this.tripService.getTripById(this.trip.id).subscribe((trip) => {
      this.trip = trip;
      this.storage.set('currentPositions', this.userMarkers).then(() => {
        if(this.userMarkerSet == true) {
          // Reposition Markers if they already exist
          for(let i=0; i < this.userMarkers.length; i++) {
            this.userMarkers[i].setPosition(this.trip.geoCoord[i].location);
          }
 
          // Remove existing markers if they are set
          // for(let i=0; i < this.userMarkers.length; i++) {
          //   this.userMarkers[i].remove();
          // }
          // this.userMarkers = [];
          // this.userMarkerSet = false;
        }
        else {
          // Add new updated markers
          let iconPath: string;
          for(let i=0; i < this.trip.geoCoord.length; i++) {
            if(this.user.id == this.trip.geoCoord[i].userId) {
              // iconPath = '../../../assets/icon/round-marker.svg';
              iconPath = 'assets/icon/round-marker.svg';
            }
            else {
              // iconPath = '../../../assets/icon/round-marker-fr.png';
              iconPath = 'assets/icon/round-marker-fr.png';
            }
            this.userMarkers.push(this.map.addMarkerSync({
              title: this.trip.geoCoord[i].userId,
              animation: 'DROP',
              icon: iconPath,
              position: this.trip.geoCoord[i].location
            }).on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
              // last is the last waypoint to be added.
              let last = this.userMarkers.length - 1;
              if(this.userMarkers[last].isInfoWindowShown()) {
                this.userMarkers[last].hideInfoWindow();
              }
              else {
                this.userMarkers[last].showInfoWindow();
              }
            }));    
            
            // Storing index location of User's marker
            if(this.user.id == this.trip.geoCoord[i].userId) {
              this.userMarkerIndex = i;
            }
          }
          this.userMarkerSet = true;
        }
        
        this.distanceCalculation();
  
      }).catch(() => {
        setTimeout(() => {
          this.addUserMarkers();
        }, 1000);
      });      
    });

  }

  addCircle() {
    // fillColor: RRGGBBAA, with AA being opacity
    if(this.circle == undefined) {
      setTimeout(() => {
        this.circle = this.map.addCircleSync({
          'center': this.userCoord,
          'radius': 5000,
          'strokeColor' : '#AA00FF',
          'strokeWidth': 5,
          'fillColor' : '#73e2a715'
        });
        console.log('Distance to be covered: ', this.distanceToBeCovered);
      }, 3000);
    }
    else {
      if(this.circle.getCenter() != this.userCoord) {
        this.circle.setCenter(this.userCoord);
      }
    }
    if(this.distanceToBeCovered != 0) {
      // If distance to be covered is less than 5 kms
      if(this.distanceToBeCovered <= 5) {
        this.drawRouteToFuelStation();
      }
    }
  }


  drawRouteToFuelStation() {
    let direction;
    console.log('Current location before fuel: ', this.currentLocation);
    this.googleService.getFuelStation(this.currentLocation).subscribe((data) => {
      this.fuelStation = data;

      if(this.fuelMarker == undefined) {
        this.fuelMarker = this.map.addMarkerSync({
          title: this.fuelStation.data.results[0].name,
          icon: this.fuelStation.data.results[0].name.icon,
          animation: 'DROP',
          position: this.fuelStation.data.results[0].geometry.location
        });  
      }

      this.googleService.getDirection(this.currentLocation.lat + ',' + this.currentLocation.lng, 
      this.fuelStation.data.results[0].geometry.location.lat + ',' 
      + this.fuelStation.data.results[0].geometry.location.lng, '').subscribe((res) => {
        direction = res;
        console.log('FUEL DIRECTION: ', direction);
        let encodedPath = direction.data.routes[0].overview_polyline.points;
        if(this.fuelStationRoute == undefined) {
          this.fuelStationRoute = this.map.addPolylineSync({
            points: GoogleMaps.getPlugin().geometry.encoding.decodePath(encodedPath, 5),
            color: '#aa4465',
            width: 3,
            geodesic: true,
            clickable: false
          });
        }
        else {
          // If polyline already exists
          this.fuelStationRoute.setPoints(GoogleMaps.getPlugin().geometry.encoding.decodePath(encodedPath, 5));
        }
      });
    });

  }


  // Calculate distance point by point in periodic intervals of 12 seconds
  distanceCalculation() {
    let direction;
    if(this.prevLocation != undefined) {
      this.distanceInterval = setInterval(() => {
        this.googleService.getDirection(
          this.prevLocation.lat + ',' + 
          this.prevLocation.lng, this.currentLocation.lat + ',' + 
          this.currentLocation.lng, '').subscribe((res) => {
            direction = res;
            this.totalCoveredDistance += direction.data.routes[0].legs[0].distance.value;
          }, (err) => {
            console.log(err);
          });
      }, 12000);
    }
  }


  // To get average speed
  speedCalculation() {

    // Get the device current acceleration
    this.deviceMotion.getCurrentAcceleration().then(
      (acceleration: DeviceMotionAccelerationData) => {
        console.log(acceleration);
        // x is breadthwise acceleration, y lengthwise, and z heightwise. Acceleration calculated 
        // every 5 seconds
        if(this.totalSpeed == null) {
          this.totalSpeed = {
            'total': 0,
            'dividedBy': 0
          };
        }
        this.totalSpeed.total += (Math.max(acceleration.x, acceleration.y, acceleration.z) * 5);
        this.totalSpeed.dividedBy += 1;
      }, (err: any) =>
        console.log(err)
    );

  }

  tripComplete() {
    // if(Spherical.computeDistanceBetween(
    //   this.userMarkers[this.userMarkerIndex].getPosition(), this.circle.getCenter()) < 100) {
      if(Spherical.computeDistanceBetween(
        this.userCoord, this.destinationMarker.getPosition()) < 100) {
        this.alertService.clientToast('Trip Completed');
        // Multiply 18/5 to convert m/s to km/hr

        this.avgSpeed = (this.totalSpeed.total / this.totalSpeed.dividedBy) * (18/5);
        this.storage.set('avgSpeed', this.avgSpeed).then(() => {
          this.storage.remove('totalSpeed').then(() => {
            console.log('totalSpeed removed.');
          }).catch(() => {
            console.log('No totalSpeed in storage');
          });
        });

        this.storage.set('distanceCovered', this.totalCoveredDistance);

        this.tripService.updateTrip(this.trip.id, {'status': 'COMPLETE'}).subscribe((res) => {
          console.log(res);
          this.router.navigateByUrl('members/trip-complete');
        }, (err) => {
          console.log(err);
        });
    }
    else {
      console.log('Yet to reach destination.');
    }
  }

}
