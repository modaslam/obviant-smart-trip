import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GoogleService } from '../../services/google/google.service';
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


@Component({
  selector: 'app-view-route',
  templateUrl: './view-route.page.html',
  styleUrls: ['./view-route.page.scss'],
})
export class ViewRoutePage implements OnInit {

  map: GoogleMap;
  route: any;
  // Default zoom for all routes shown on map
  zoomLevel: number = 8;
  sourceMarker: Marker;
  destinationMarker: Marker;
  waypointMarkers: any[] = [];
  mapLoaded: boolean = true;

  routeSubscriber: Subscription;

  constructor(
    private platform: Platform, 
    private navExtras: NavExtrasService,
    private router: Router,
    public googleService: GoogleService
  ) { }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    await this.platform.ready();
    this.routeSubscriber = this.navExtras.currentSubject.subscribe((data) => {
      this.map = null;
      this.mapLoaded = false;
      this.waypointMarkers = [];
      this.route = data;
      console.log(this.route);
      if(this.route.distance > 94) {
        this.zoomLevel = 6;
      }
      else if(this.route.distance < 30) {
        this.zoomLevel = 10;
      }
      let midCoords = Math.floor(this.route.latlngPolyline.length / 2);
      console.log('Middle coordinates: ',midCoords);
      this.mapLoaded = true;
      try {
        this.loadMap(this.route.latlngPolyline[midCoords].lat, this.route.latlngPolyline[midCoords].lng);
      }
      catch(e) {
        console.log('Error Info:', e);
      }
    });
  }

  // ionViewWillEnter() {
  //   if (!this.navExtras.mapLoaded) {
  //     // reset div & *then* set visibility to smooth out reloading of map
  //     this.map.setDiv('trip_canvas');
  //     this.map.setVisible(true);
  //     setTimeout(()=>{
  //       // hack to fix occasionally disappearing map
  //       this.map.setDiv('trip_canvas');
  //     }, 1000);   
  //   } else {
  //     this.navExtras.mapLoaded = false;
  //   }
  // }

  // ionViewWillLeave() {
  //   this.routeSubscriber.unsubscribe();
  //   // unset div & visibility on exit
  //   this.map.setVisible(false);
  //   this.map.setDiv(null);
  // }
  // ionViewWillLeave() {
  //   // unset div & visibility on exit
  //   this.map.setVisible(false);
  //   this.map.setDiv(null);
  // }

  async loadMap(latitude, longitude) {
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

    this.map = GoogleMaps.create('trip_canvas', mapOptions); 

    this.sourceMarker = this.map.addMarkerSync({
      title: this.route.waypoints[0],
      // icon: 'blue',
      // icon: '../../../assets/icon/source-flag.png',
      icon: 'assets/icon/source-flag.png',
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
      // icon: '../../../assets/icon/destination-flag.png',
      icon: 'assets/icon/destination-flag.png',
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
        // icon: '../../../assets/icon/waypoint-marker.png',
        icon: 'assets/icon/waypoint-marker.png',
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

  cancel() {
    this.map.setVisible(false);
    this.map.setDiv(null);
    this.router.navigateByUrl('members/tabs/explore');
  }

  start() {
    // For informing its not a newly generated route without a name
    this.navExtras.setRouteFlag();

    this.map.setVisible(false);
    this.map.setDiv(null);
    this.navExtras.setExtras(this.route);
    // Navigates to Trip Details
    this.router.navigateByUrl('members/tabs/dashboard/' + this.route.waypoints.length);
    console.log(this.route);
  }

}
