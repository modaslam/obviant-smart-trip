import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
// import { map, catchError } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import * as env from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  private integrationServerUrl: string;

  constructor(
    public http: HttpClient,
    private storage: Storage
  ) {
    this.integrationServerUrl = env.environment.serverUrl + 'GoogleServices';
    console.log('Hello GoogleService Provider');
  }

  getRecentSearches() {
    return new Promise((resolve, reject) => {
      this.storage
        .ready()
        .then(() => {
          // set a key/value
          // Or to get a key/value pair
          this.storage
            .get('recentSearches')
            .then(recentSearches => {
              resolve(recentSearches);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  addRecentSearch(recentSearch) {
    return new Promise((resolve, reject) => {
      this.storage
        .ready()
        .then(() => {
          // set a key/value
          // Or to get a key/value pair
          this.storage
            .get('recentSearches')
            .then(recentSearches => {
              console.log(recentSearches);
              if (!recentSearches) {
                recentSearches = [];
              }
              if (recentSearches.indexOf(recentSearch) < 0 && recentSearch) {
                recentSearches.unshift(recentSearch);

                this.storage
                  .set('recentSearches', recentSearches)
                  .then(recentSearches => {
                    resolve(recentSearches);
                  })
                  .catch(err => reject(err));
              } else {
                recentSearches.splice(recentSearches.indexOf(recentSearch), 1);
                recentSearches.unshift(recentSearch);

                this.storage
                  .set('recentSearches', recentSearches)
                  .then(recentSearches => {
                    resolve(recentSearches);
                  })
                  .catch(err => reject(err));
              }
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  removeRecentSearch(recentSearch) {
    return new Promise((resolve, reject) => {
      this.storage
        .ready()
        .then(() => {
          // set a key/value
          // Or to get a key/value pair
          this.storage
            .remove('recentSearches')
            .then(recentSearches => {
              if (!recentSearches) {
                recentSearches = [];
              }
              if (recentSearches.indexOf(recentSearch) < 0 && recentSearch) {
                recentSearches.unshift(recentSearch);

                //  this.storage.remove('recentSearches',recentSearches).then((recentSearches) => {

                //     resolve(recentSearches);
                // }).catch((err)=>reject(err));}
                // else{
                resolve(recentSearches);
              }
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }

  getPlaces(searchString) {
    return this.http
      .get(
        `${
          this.integrationServerUrl
        }/place/autocomplete?searchString=${searchString}`
      );
  }

  getGeocodeInfomation(address) {
    return this.http
      .get(`${this.integrationServerUrl}/geocode?address=${address}`);
  }

  getReverseGeocodeInformation(latlng) {
    return this.http
      .get(`${this.integrationServerUrl}/reverseGeocode?latlng=${latlng}`);
  }

  getTimeToTravel(origin, destination, travelMode = 'Driving') {
    return this.http
      .get(
        `${
          this.integrationServerUrl
        }/directions?origin=${origin}&destination=${destination}&travelMode=${travelMode}`
      );
  }

  getDirection(origin, destination, waypoints) {
    return this.http
      .get(
        `${this.integrationServerUrl}/directions?origin=${origin}&destination=${destination}&waypoints=${waypoints}`
      );
  }

  getFuelStation(location) {
    return this.http
      .get(`
        ${this.integrationServerUrl}/nearbySearch?location=${location.lat},${location.lng}
          &rankby=distance&type=gas_station`
      );
  }
}
