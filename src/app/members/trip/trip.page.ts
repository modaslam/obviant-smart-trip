import { Component, OnInit, NgZone } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform } from '@ionic/angular';
// import { google } from 'google-maps';
import { AlertService } from '../../services/alert/alert.service';
import { BehaviorSubject } from 'rxjs';
import { GoogleService } from '../../services/google/google.service';
import { Router } from '@angular/router';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
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
  Polyline
} from '@ionic-native/google-maps';

declare var google;

@Component({
  selector: 'app-trip',
  templateUrl: './trip.page.html',
  styleUrls: ['./trip.page.scss'],
})
export class TripPage implements OnInit {

  map: GoogleMap;

  mapLoaded: boolean = true;

  // autocompleteService = new google.maps.places.AutocompleteService();
  // geocoder = new google.maps.Geocoder();
  sourceMarker: Marker;
  destinationMarker: Marker;
  // placesService: any;
  place: any;
  // Query for Searchbox
  query: string = '';
  // Array to store list of places on query
  places: any = [];
  searchDisabled: boolean;
  // Address of source
  source: string;
  // Address of source in latlng
  sourceCoord: any = {};
  destination: string;
  destinationCoord: any = {};
  // Initially source, destination and waypoint(s) are not set
  sourceSet = 0;
  autoComplete: any;
  geoCodeInfo: any;
  // To store google directions api result
  direction: any;
  coordSet: any = false;
  // To store waypoints
  waypoints: any = [];
  // To store waypoints as a string for request
  combinedWaypoints: string = '';
  totalWaypoints: number;
  // To store markers of individual waypoints
  waypointMarkers: any = [];
  waypointCoord: any = [];
  wayPointOrder: any = [];
  // To store polylines for each route
  polylines: any = [];
  // To enable and disable Find Direction button
  flag: boolean;
  // To store route length of each route
  routeLengths: any = [];
  // To store route length of the selected route
  selectedRouteLength: any;
  // To store the legs of a journey for each route
  legs: any = [];
  // To store the legs of the journey for selected route
  selectedRouteLegs: any;
  // To store duration of each route
  duration: any = [];
  // To store duration of selected route
  selectedRouteDuration: any;
  // To store encoded polyline of selected route
  selectedPolyline: string;
  // To store polyline of selected route in latlng
  selectedLatLngPolyline: any;
  latlngPolylines: any = [];

  // Store index of shortest route
  shortestRoute: number;

  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loading: any;

  // To set colors for each alternative route with the color at index = 5 assigned to shortest route
  colors = ['#4f345a', '#5d4e6d', '#9799ca', '#bd93d8', '#b47aea', '#ea3b2e'];


  constructor(
    private geolocation: Geolocation, 
    private platform: Platform, 
    private zone: NgZone,
    private router: Router,
    private navExtras: NavExtrasService,
    public alertService: AlertService,
    public googleService: GoogleService,
  ) {
  }

  // Operations to be performed on initialization.
  async ngOnInit() {
    this.totalWaypoints = 0;
    this.flag = false;
    // A loader that disables user actions.
    this.alertService.createLoader('Please wait...').then(() => {
      this.isLoading.next(true);
    });
    // Wait for the android platform to be ready.
    await this.platform.ready();

    await this.geolocation.getCurrentPosition().then((resp) => {
      console.log("Longitude: " + resp.coords.longitude + ", Latitude: " + resp.coords.latitude);
      // Method to create the map with given coordinates as target.
      this.loadMap(resp.coords.latitude, resp.coords.longitude);
      
     }).catch((error) => {
       console.log('Error getting location', error);
     });
     
     // Watch for changes in user's position.
     let watch = this.geolocation.watchPosition();
     watch.subscribe((data) => {
      console.log("Longitude1: " + data.coords.longitude + ", Latitude1: " + data.coords.latitude);
      this.map.getMyLocation();
     });
  }

  // ionViewWillEnter() {
  //   if (!this.navExtras.mapLoaded) {
  //     // reset div & *then* set visibility to smooth out reloading of map
  //     this.ngOnInit();
  //     // this.map.setDiv('map_canvas');
  //     this.map.setVisible(true);
  //     setTimeout(()=>{
  //       // hack to fix occasionally disappearing map
  //       this.map.setDiv('map_canvas');
  //     }, 1000);   
  //   } else {
  //     this.navExtras.mapLoaded = false;
  //   }
  // }

  // ionViewWillLeave() {
  //   // unset div & visibility on exit
  //   this.map.setVisible(false);
  //   this.map.setDiv(null);
  // }

  // ionViewWillLeave() {
  //   this.map.remove();
  // }

  async loadMap(latitude, longitude) {

    // This code is necessary for browser
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyBKZcWtZRqoo9i2uiV_2jIZT-fD9f1T5tE',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyBKZcWtZRqoo9i2uiV_2jIZT-fD9f1T5tE'
    });
    
    this.sourceCoord = {
      'lat': latitude,
      'lng': longitude
    }

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
         zoom: 15,
         tilt: 30
      },
      'mapType': 'MAP_TYPE_ROADMAP'
    };

    // Create the map on a div having id 'map_canvas'
    this.map = GoogleMaps.create('map_canvas', mapOptions); 
    // await this.googlePlaces.loadPlaces();
    
    this.searchDisabled = false;
    
    this.isLoading.subscribe((value) => { 
      console.log(value);
      if (true === value) {
          this.alertService.dismissLoader();
          this.isLoading.next(false);
      }
    });

    // For when user taps a location in map
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(this.onMapClick.bind(this));
   
    this.sourceMarker = this.map.addMarkerSync({
      title: 'Current Location',
      // icon: 'blue',
      // icon: '../../../assets/icon/source-flag.png',
      icon: 'assets/icon/source-flag.png',
      animation: 'DROP',
      position: {
        lat: latitude,
        lng: longitude
      }
    });

    this.totalWaypoints++;

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

    this.googleService.getReverseGeocodeInformation(latitude + ',' + longitude).subscribe((res) => {
      let locationAddress: any = res;
      this.source = locationAddress.data.plus_code.compound_code;

    });

    this.alertService.confirmAlert(
      'Confirm location', 
      'Do you want to confirm your current location to be the starting point?', 
      'Yes', 
      () => this.sourceSet = 1, 
      'No', 
      () => { this.sourceSet = 0; this.map.clear(); this.totalWaypoints = 0; }
    );
  }

  // Used for searching places in a search/query box.
  searchPlace() {
    if(this.query.length > 0 && !this.searchDisabled) {
      // let config = {
      //   types: ['geocode'],
      //   input: this.query
      // }
      this.googleService.getPlaces(this.query).subscribe((res) => {
        console.log(res);
        this.autoComplete = res;
        let predictions = this.autoComplete.data.predictions;
        if(this.autoComplete.data.status === 'OK' && predictions) {
          this.places = [];

            this.zone.run(() => {
              predictions.forEach((prediction) => {
                this.places.push(prediction);
              });
            });
        }
      });
      // this.autocompleteService.getPlacePredictions(config, (predictions, status) => {
      //   if(status == google.maps.places.PlacesServiceStatus.OK && predictions){

      //       this.places = [];

      //       this.zone.run(() => {
      //         predictions.forEach((prediction) => {
      //           this.places.push(prediction);
      //         });
      //       });
      //   }
      // });
    } else {
        this.places = [];
    }
  }

  // When selecting a place listed on the search box.
  selectPlace(place) {
    // this.query = place.description;
    this.query = '';
    this.places = [];
    console.log(place);
    console.log("dsfsfssihbhjbhbjion", place.description);
    console.log(this.googleService.getGeocodeInfomation(place.description));

    // Handle if directions have already been found
    if(this.sourceSet == 3) {
      this.alertService.clientToast('Route(s) already set.');
    }

    //Handle if both source and destinations are set
    else if(this.sourceSet == 2) {
      this.alertService.clientToast("Waypoint added");
      this.googleService.getGeocodeInfomation(place.description).subscribe(res => {
        this.geoCodeInfo = res;
        let position = this.geoCodeInfo.data.results[0].geometry.location;

        this.waypointCoord.push(position.lat + ',' + position.lng);

        // this.map.setCameraTarget(position);
        this.destinationCoord = position;
        this.waypointMarkers.push(this.map.addMarkerSync({
            title: place.description,
            animation: 'DROP',
            // icon: '../../../assets/icon/waypoint-marker.png',
            icon: 'assets/icon/waypoint-marker.png',
            // icon: 'green',
            position: position
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

        this.totalWaypoints++;

        if(this.waypoints == '') {
          this.combinedWaypoints = 'optimize:true';
        }
        // Get name and other details given the coordinates as input.
        this.googleService.getReverseGeocodeInformation(position.lat + ',' + position.lng).subscribe((res) => {
          console.log('Reversegeo: ', res);
          let locationAddress: any = res;
          this.waypoints.push(locationAddress.data.plus_code.compound_code);
          this.combinedWaypoints = this.combinedWaypoints + '|via:' + locationAddress.data.plus_code.compound_code;
        });
      });
      this.places = [];
    }

    // For Destination coordinates and marker
    else if(this.sourceSet == 1) {

      this.googleService.getGeocodeInfomation(place.description).subscribe(res => {
        this.geoCodeInfo = res;
        console.log("Boyoo", res);
        let position = this.geoCodeInfo.data.results[0].geometry.location;
        console.log("New pos",this.geoCodeInfo.data.results[0].geometry.location);

        this.totalWaypoints++;

        // this.map.setCameraTarget(position);
        this.destinationCoord = position;
          this.destinationMarker = this.map.addMarkerSync({
            title: place.description,
            animation: 'DROP',
            // icon: '../../../assets/icon/destination-flag.png',
            icon: 'assets/icon/destination-flag.png',
            position: position
          });
          this.destinationMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
            if(this.destinationMarker.isInfoWindowShown()) {
              this.destinationMarker.hideInfoWindow();
            }
            else {
              this.destinationMarker.showInfoWindow();
            }
            // alert('clicked');
          });

          this.googleService.getReverseGeocodeInformation(position.lat + ',' + position.lng).subscribe((res) => {
            console.log('Reversegeo: ', res);
            let locationAddress: any = res;
            this.destination = locationAddress.data.plus_code.compound_code;
          });
        });
        this.places = [];

      //convert Address string to lat and long
      // this.geocoder.geocode({ 'placeId': place.place_id }, (results, status) => {
      //   if(status === 'OK' && results[0]){
      //     console.log("Posihbhjbhbjion", results[0].formatted_address);

      //     //To autocomplete half-filled queries with selected one from list
      //     this.query = results[0].formatted_address;

      //     let options: GeocoderRequest = {
      //       address: results[0].formatted_address
      //     };
      //     // Address -> latitude,longitude
      //     Geocoder.geocode(options)
      //     .then((results: GeocoderResult[]) => {
      //       console.log(results);
      //       console.log('Position', results[0].position);
      //       this.destinationCoord = results[0].position;
      //       this.destinationMarker = this.map.addMarkerSync({
      //         title: 'Destination',
      //         animation: 'DROP',
      //         position: results[0].position
      //       });
      //       this.destinationMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      //         alert('clicked');
      //       });
      //     });
      //     this.places = [];
      //   }
      // });
      this.sourceSet = 2;
      this.alertService.clientToast("Final destination set!")
      this.coordSet = true;
    } 
    // For Source coordinates and marker, only if sourceSet = 0
    else {
      this.map.clear();
      console.log(place);

      this.totalWaypoints++;

      this.googleService.getGeocodeInfomation(place.description).subscribe(res => {
        this.geoCodeInfo = res;
        console.log("Boyoo", res);
        let position = this.geoCodeInfo.data.results[0].geometry.location;
        console.log("New pos",this.geoCodeInfo.data.results[0].geometry.location);

        // this.map.setCameraTarget(position);
        this.sourceCoord = position;
          this.sourceMarker = this.map.addMarkerSync({
            title: place.description,
            // icon: 'blue',
            // icon: '../../../assets/icon/source-flag.png',
            icon: 'assets/icon/source-flag.png',
            animation: 'DROP',
            position: position
          });
          this.sourceMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          if(this.sourceMarker.isInfoWindowShown()) {
            this.sourceMarker.hideInfoWindow();
          }
          else {
            this.sourceMarker.showInfoWindow();
          }
            // alert('clicked');
          });

          this.googleService.getReverseGeocodeInformation(position.lat + ',' + position.lng).subscribe((res) => {
            console.log('Reversegeo: ', res);
            let locationAddress: any = res;
            this.source = locationAddress.data.plus_code.compound_code;
          });
        });
        this.places = [];
        this.sourceSet = 1;
        this.alertService.clientToast("Starting location set!")
          // let location = {
          //     lat: null,
          //     lng: null,
          //     name: place.name
          // };

          // this.placesService.getDetails({placeId: place.place_id}, (details) => {

          //     this.zone.run(() => {

          //         location.name = details.name;
          //         location.lat = details.geometry.location.lat();
          //         location.lng = details.geometry.location.lng();
          //         this.location = location;
          //         console.log("Location is", location);

          //     });

          // });
      // this.places = [];

      //convert Address string to lat and long
      
      // this.geocoder.geocode({ 'placeId': place.place_id }, (results, status) => {
      //   if(status === 'OK' && results[0]){
      //     console.log("Posihbhjbhbjion", results[0].formatted_address);

      //     //To autocomplete half-filled queries with selected one from list
      //     this.query = results[0].formatted_address;

      //     let options: GeocoderRequest = {
      //       address: results[0].formatted_address
      //     };
      //     // Address -> latitude,longitude
      //     Geocoder.geocode(options)
      //     .then((results: GeocoderResult[]) => {
      //       console.log(results);
      //       console.log('Position', results[0].position);
      //       this.sourceCoord = results[0].position;
      //       this.sourceMarker = this.map.addMarkerSync({
      //         title: 'Source',
      //         icon: 'blue',
      //         animation: 'DROP',
      //         position: results[0].position
      //       });
      //       this.sourceMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      //         alert('clicked');
      //       });
      //     });
      //     this.places = [];
      //     this.sourceSet = true;
      //   }

      //   // if(status === 'OK' && results[0]){
      //   //   console.log("Posihbhjbhbjion", results[0].geometry.location.lat);
      //   //   this.latitude = results[0].geometry.location.lat;
      //   //   this.longitude = results[0].geometry.location.lng;
      //   //   console.log("Position", this.latitude);
      //   //   // this.sourceMarker = this.map.addMarkerSync({
      //   //   //   title: 'Ionic',
      //   //   //   icon: 'blue',
      //   //   //   animation: 'DROP',
      //   //   //   position: {
      //   //   //     lat: results[0].geometry.location.lat,
      //   //   //     lng: results[0].geometry.location.lng
      //   //   //   }
      //   //   // });
      //   //   // this.sourceMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
      //   //   //   alert('clicked');
      //   //   // });
      //   // }
      // });
    }
  }

  // To add source and destination when map is clicked.
  onMapClick(params: any[]) {
    
    let position: LatLng = params[0];
    let map: GoogleMap = params[1];
    console.log("dsfsfssihbhjbhbjion", map);
    console.log("bhbjion", position);

    // Handle if directions have already been found
    if(this.sourceSet == 3) {
      this.alertService.clientToast('Route(s) already set.');
    }

    // Handle if both source and destination are set
    else if(this.sourceSet == 2) {
      this.alertService.clientToast("Waypoint added");
      // this.map.setCameraTarget(position);
      this.waypointMarkers.push(this.map.addMarkerSync({
        title: 'Custom waypoint',
        animation: 'DROP',
        // icon: '../../../assets/icon/waypoint-marker.png',
        icon: 'assets/icon/waypoint-marker.png',
        // icon: 'green',
        position: position
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

      this.totalWaypoints++;
      this.waypointCoord.push(position.lat + ',' + position.lng);

      if(this.waypoints == '') {
        this.combinedWaypoints = 'optimize:true';
      }

      this.googleService.getReverseGeocodeInformation(position.lat + ',' + position.lng).subscribe((res) => {
        console.log('Reversegeo: ', res);
        let locationAddress: any = res;
        this.waypoints.push(locationAddress.data.plus_code.compound_code);
        this.combinedWaypoints = this.combinedWaypoints + '|' + locationAddress.data.plus_code.compound_code;
        // Using via:
        // this.combinedWaypoints = this.combinedWaypoints + '|via:' + locationAddress.data.plus_code.compound_code;
      });

      console.log('Waypoints are ', this.waypoints);

    }

    // For Destination coordinates and marker
    else if(this.sourceSet == 1) {

      this.totalWaypoints++;

      // this.map.setCameraTarget(position);
      this.destinationCoord = position;
      console.log(this.destinationCoord);
      this.destinationMarker = this.map.addMarkerSync({
        title: 'Destination',
        animation: 'DROP',
        // icon: '../../../assets/icon/destination-flag.png',
        icon: 'assets/icon/destination-flag.png',
        position: position
      });
      this.destinationMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        if(this.destinationMarker.isInfoWindowShown()) {
          this.destinationMarker.hideInfoWindow();
        }
        else {
          this.destinationMarker.showInfoWindow();
        }
        // alert('clicked');
      });
      this.googleService.getReverseGeocodeInformation(position.lat + ',' + position.lng).subscribe((res) => {
        console.log('Reversegeo: ', res);
        let locationAddress: any = res;
        this.destination = locationAddress.data.plus_code.compound_code;
      });

      this.places = [];
      this.sourceSet = 2;
      this.alertService.clientToast("Final destination set!");
      this.coordSet = true;
    } 

    // For Source coordinates and marker, only if sourceSet = 0
    else {
      this.totalWaypoints++;
      this.map.clear();
      // this.map.setCameraTarget(position);
      this.sourceCoord = position;
      this.sourceMarker = this.map.addMarkerSync({
        title: 'Starting point',
        // icon: '../../../assets/icon/source-flag.png',
        icon: 'assets/icon/source-flag.png',
        // icon: 'blue',
        animation: 'DROP',
        position: position
      });
      this.sourceMarker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
        if(this.sourceMarker.isInfoWindowShown()) {
          this.sourceMarker.hideInfoWindow();
        }
        else {
          this.sourceMarker.showInfoWindow();
        }
        // alert('clicked');
      });
      this.googleService.getReverseGeocodeInformation(position.lat + ',' + position.lng).subscribe((res) => {
        console.log('Reversegeo: ', res);
        let locationAddress: any = res;
        this.source = locationAddress.data.plus_code.compound_code;
      });

      this.sourceSet = 1;
      this.alertService.clientToast("Starting locations set!")
      this.coordSet = true;
    }
  }
  
  // To find the direction and draw the polyline/route
  findDirection() {
    console.log("Original waypoint order: ", this.waypoints);
    let source = this.sourceCoord.lat + ', ' + this.sourceCoord.lng;
    let destination = this.destinationCoord.lat + ', ' + this.destinationCoord.lng;

    this.googleService.getDirection(source, destination, this.combinedWaypoints).subscribe(res => {
      console.log("Directions:", res);
      this.direction = res;

      // Check if there are one or more routes available.
      if(this.direction.data.status !== "ZERO_RESULTS") {

        let totalRoutes = 5;
        if(this.direction.data.routes.length < 5) {
          totalRoutes = this.direction.data.routes.length;
          if(totalRoutes == 1) {
            this.flag = true;
          }
        }

        // Initially, set shortest route to be the first route.
        this.shortestRoute = 0;
        
        console.log("Points2:", this.direction.data.routes[0].overview_polyline);
        let encodedPath;
        
        // let polylinePoints: ILatLng[] = Encoding.decodePath(this.encodedPath);
        // let polylinePoints = google.maps.geometry.encoding.decodePath(encodedPath);
        let polylinePoints;
        console.log("color", this.colors[0]);
        for(let i = 0; i < totalRoutes; i++) {
          // Cycle through each route to find the shortest one
          if(this.direction.data.routes[i].legs[0].distance.value < 
            this.direction.data.routes[this.shortestRoute].legs[0].distance.value) {
              this.shortestRoute = i;
            }
          encodedPath = this.direction.data.routes[i].overview_polyline.points;
          console.log("Points1:", encodedPath);
          // polylinePoints = this.decode(encodedPath);
          polylinePoints = GoogleMaps.getPlugin().geometry.encoding.decodePath(encodedPath, 5);
          console.log("decoded path", polylinePoints);
          this.latlngPolylines.push(polylinePoints);
      
          this.map.setCameraTarget = polylinePoints;
          this.legs.push(this.direction.data.routes[i].legs);
          
          

          // Add routes to array
          this.polylines.push(this.map.addPolylineSync({
            points: polylinePoints,
            color: this.colors[i],
            width: 5,
            geodesic: true,
            clickable: true
          }));

          if(this.flag) {
            console.log('The path points are ', this.polylines[0].getPoints());

            // Different legs of the journey, including waypoints
            this.selectedRouteLegs = this.direction.data.routes[0].legs;
            
            this.selectedPolyline = this.direction.data.routes[0].overview_polyline.points;
            this.selectedLatLngPolyline = this.latlngPolylines[0];

            console.log("Route points are as follows: ", this.selectedLatLngPolyline);

            this.wayPointOrder = this.direction.data.routes[0].waypoint_order;
            this.orderWaypoints();

            console.log("New path length is ", this.selectedRouteLength);
            console.log("New path length type is ", typeof(this.selectedRouteLength));
    
          }

          // Compute Route length
          // this.routeLengths.push(Spherical.computeLength(this.polylines[i].getPoints()));
          let temp1 = 0, temp2 = 0;
          for(let j = 0; j < this.direction.data.routes[i].legs.length; j++) {
            temp1 += this.direction.data.routes[i].legs[j].distance.value;
            temp2 += this.direction.data.routes[i].legs[j].duration.value;
          }
          this.routeLengths.push(temp1);
          this.duration.push(temp2);

          if(this.flag) {
            //Compute Route length
            // this.selectedRouteLength = (Spherical.computeLength(this.polylines[0].getPoints()) / 1000).toFixed(3);
            this.selectedRouteLength = (this.routeLengths[0] / 1000).toFixed(3);
            this.selectedRouteDuration = this.duration[0];
            break;
          }
          
          this.polylines[i].on(GoogleMapsEvent.POLYLINE_CLICK).subscribe((params: any) => {
            let position: LatLng = <LatLng>params[0];
            console.log("Polyline clicked");

            this.selectedRouteLegs = this.legs[i];
            console.log("Legs are: ", this.legs[i]);
            this.selectedRouteLength = (this.routeLengths[i] / 1000).toFixed(3);
            this.selectedRouteDuration = this.duration[i];

            this.selectedPolyline = this.direction.data.routes[i].overview_polyline.points;
            this.selectedLatLngPolyline = this.latlngPolylines[i];

            this.wayPointOrder = this.direction.data.routes[i].waypoint_order;

            this.orderWaypoints();

            this.flag = true;

            for(let j =0; j < totalRoutes; j++) {
              // If not selected route, remove the rest
              if(j != i) {
                this.polylines[j].remove();
              }
            }
          });
        }
        // Coloring shortest route red
        this.polylines[this.shortestRoute].setStrokeColor(this.colors[5]);
        // Displaying the shortest route on top of the other routes
        this.polylines[this.shortestRoute].setZIndex(6);
      }
      else {
        this.alertService.clientToast("Unable to direct you to your destination.");
      }
      
      
      // let path = this.map.addPolylineSync({
      //   'points': polylinePoints,
      //   'color' : '#EA3B2E',
      //   'width': 5,
      // });
    });
    this.sourceSet = 3;
  }

  // To decode encoded polyline to points
  // decode(encoded){

  //   // array that holds the points

  //   var points=[ ];
  //   var index = 0, len = encoded.length;
  //   var lat = 0, lng = 0;
  //   while (index < len) {
  //     var b, shift = 0, result = 0;
  //     do {
  //       b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
  //       result |= (b & 0x1f) << shift;
  //       shift += 5;
  //       } while (b >= 0x20);
  //     var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
  //     lat += dlat;
  //     shift = 0;
  //     result = 0;
  //     do {
  //       b = encoded.charAt(index++).charCodeAt(0) - 63;
  //       result |= (b & 0x1f) << shift;
  //       shift += 5;
  //       } while (b >= 0x20);
  //     var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
  //     lng += dlng;
  //     points.push({lat:( lat / 1E5),lng:( lng / 1E5)})  ;
  //   }
  //   return points;
  // }

  // Clear everything on the map.
  clearMap() {
    this.map.clear();
    this.sourceSet = 0;
    this.coordSet = false;
    this.totalWaypoints = 0;
    this.waypoints = [];
    this.combinedWaypoints = '';
    this.polylines = [];
    this.flag = false;
    this.selectedRouteLength = '';
    this.legs = [];
    this.selectedRouteLegs = '';
    this.latlngPolylines = [];
    this.duration = [];
  }

  // After Route has been set and user wishes to continue with it.
  continue() {
    let details= {
      "distance": this.selectedRouteLength,
      "legs": this.selectedRouteLegs,
      "overviewPolyline": this.selectedPolyline,
      "latlngPolyline": this.selectedLatLngPolyline,
      "duration": this.selectedRouteDuration,
      "waypoints": this.waypoints,
      "source": this.source.slice(8),
      "destination": this.destination.slice(8)
    };
    // this.map.setDiv(null);
    // this.map.remove();

    // For storing data to be passed to another page
    this.navExtras.setExtras(details);
    
    // Navigate to TripDetails page.
    this.router.navigateByUrl('members/tabs/dashboard/' + this.totalWaypoints);
    console.log("Sorted waypoint order: ", this.waypoints);
  }

  // Sort waypoints according to waypoint order
  orderWaypoints() {
    console.log("Waypoint order in number: ", this.wayPointOrder);
    let temp = this.waypoints;
    this.waypoints = []
    if(this.wayPointOrder.length != 0) {
      for(let i = 0; i < this.wayPointOrder.length; i++) {
        this.waypoints.push(temp[this.wayPointOrder[i]]);
        // temp = this.waypoints[i];
        // console.log("gafga", this.waypoints[i]);
        // // Slice is done to remove unwanted part, eg: ""9W3R+QV Verna, Goa, India""
        // this.waypoints[i] = this.waypoints[this.wayPointOrder[i]];
        // console.log("gaasfaffga", this.waypoints[this.wayPointOrder[i]]);
        // this.waypoints[this.wayPointOrder[i]] = temp;
      }
      for(let i = 0; i < this.wayPointOrder.length; i++) {
        this.waypoints[i] = this.waypoints[i].slice(8);
      }
      console.log("Sorted waypoint order: ", this.waypoints);
    }
  }
}
