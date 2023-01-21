import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { GeolocationService } from '../geolocation/geolocation.service';
import { Storage } from '@ionic/storage';
import * as env from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  apiBaseUrl: string = '';

  // For storing individual coordinates of each user in the trip
  myGeoCoords: any[] = [];
  currentLocation: any;

  constructor(
    private http: HttpClient, 
    private geolocationService: GeolocationService,
    private storage: Storage
  ) {
    this.apiBaseUrl = env.environment.serverUrl;
    // Obtain user coordinates upon initialization.
    setTimeout(() => {
      this.storage.get('UID').then((id) => {
        this.geolocationService.getCurrentPosition().then((position) => {
          this.currentLocation = {
            'lat': position.coords.latitude,
            'lng': position.coords.longitude
          };
          console.log('current pos: ', this.currentLocation);
          this.myGeoCoords.push({'userId': id, 'location': this.currentLocation});
        });
  
      });
  
      this.geolocationService.getDynamicPosition().subscribe((location) => {
        this.myGeoCoords[0].location = {
          'lat': location.coords.latitude,
          'lng': location.coords.longitude
        };
      }, (err) => {
        console.log(err);
      });
    }, 1000);
   }

  // Add a route to database
  addRoute(route) {
    return this.http.post(this.apiBaseUrl + 'routes', route);
  }

  // Add a trip to database
  addTrip(trip) {
    trip.geoCoord = this.myGeoCoords;
    console.log('Trip log 2: ', trip);
    return this.http.post(`${this.apiBaseUrl}routes/${trip.routesId}/trips`, trip);
  }

  // Get paginated query response for routes, 5 at a time
  getAllRoutes(page) {
    // http://localhost:3000/api/routes?filter[limit]=5&filter[skip]=5
    return this.http.get(this.apiBaseUrl + 'routes?filter[limit]=' + page.limit + '&filter[skip]=' + page.skip);
  }

  // Get paginated query response for routes, 5 at a time and sorted by tripCount property in descending order
  getTrendingRoutes(page) {
    return this.http.get(`
      ${this.apiBaseUrl}routes?filter[limit]=${page.limit}
                              &filter[skip]=${page.skip}
                              &filter[order]=tripCount%20DESC
    `);
  }

  // Get unfinished trip instances using owner or user id
  getTripsByUserId(myId) {
    return this.http.get(`
      ${this.apiBaseUrl}trips?filter={"where":
      {"and":[
          {"userId":"${myId}"},{"or":[
            {"status":"ONGOING"},{"status":"WAITING"}
          ]}
        ]}
      }
    `);
  }

  // Get trip instance by tripId
  getTripById(tripId) {
    return this.http.get(`${this.apiBaseUrl}trips/${tripId}`);
  }

  // Delete trip from a database
  deleteTrip(tripId) {
    return this.http.delete(`${this.apiBaseUrl}trips/${tripId}`);
  }

  // To update a Trip model instance
  updateTrip(tripId, update) {
    return this.http.patch(`${this.apiBaseUrl}trips/${tripId}`, update);
  }

  // To get the corresponding route of a trip
  getRouteForTrip(tripId) {
    return this.http.get(`${this.apiBaseUrl}trips/${tripId}/route`);
  }

  // To get number of trips for a route
  getRouteTripCount(routeId) {
    return this.http.get(`${this.apiBaseUrl}routes/${routeId}?filter[fields][tripCount]=true`);
  }

  updateRoute(routeId, update) {
    return this.http.patch(`${this.apiBaseUrl}routes/${routeId}`, update);
  }

  // Get completed trip instances from the corresponding route.
  getCompletedTripsFromRoute(routeId) {
    return this.http.get(`${this.apiBaseUrl}routes/${routeId}/trips?filter={"where":{"status":"COMPLETE"}}`);
  }

  // Get the different ratings given by users for a route.
  getRouteRating(routeId) {
    return this.http.get(`${this.apiBaseUrl}routes/${routeId}/rating`);
  }

  updateRouteRating(routeId, update) {
    return this.http.put(`${this.apiBaseUrl}routes/${routeId}/rating`, update);
  }

  addRouteRating(routeId, rating) {
    return this.http.post(`${this.apiBaseUrl}routes/${routeId}/rating`, rating);
  }
}
