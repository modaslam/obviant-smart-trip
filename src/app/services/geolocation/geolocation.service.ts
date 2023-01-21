import { Injectable } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  lat: any;
  lng: any;
  coord: any;

  constructor(private geolocation: Geolocation) {
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log("Longitude: " + resp.coords.longitude + ", Latitude: " + resp.coords.latitude);
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.coord = {
        'lat': this.lat,
        'lng': this.lng
      }
    }).catch((error) => {
       console.log('Error getting location', error);
    });

    let watch = this.geolocation.watchPosition();
     watch.subscribe((data) => {
      // data can be a set of coordinates, or an error (if an error occurred).
      // data.coords.latitude
      // data.coords.longitude
      console.log("Longitude1: " + data.coords.longitude + ", Latitude1: " + data.coords.latitude);
      this.lat = data.coords.latitude;
      this.lng = data.coords.longitude;
      this.coord = {
        'lat': this.lat,
        'lng': this.lng
      }
     });
  }

  getLat() {
    return this.lat;
  }

  getLng() {
    return this.lng;
  }

  getCurrentPosition() {
    return this.geolocation.getCurrentPosition();
  }

  getDynamicPosition() {
    return this.geolocation.watchPosition();
  }
}
