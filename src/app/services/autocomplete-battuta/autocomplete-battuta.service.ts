import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import * as env from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteBattutaService {

  apiKey: string = '';
  apiBaseUrl: string = '';


  constructor(private http: HttpClient) {
    // this.apiKey = 'dc098566e0cb99ff8bb02ac0f311ff06';
    // this.apiBaseUrl = 'http://battuta.medunes.net/api/';
    this.apiBaseUrl = env.environment.serverUrl;
  }

  // countryCode and region parameters should be empty. Parameters stand for type, countryCode and region
  getAllCountries() {
    // return this.http.get(this.apiBaseUrl + 'country/all/?key=' + this.apiKey);
    return this.http.post(`${this.apiBaseUrl}BattutaServices/country/''/''/location`, {});
  }

  // region parameter should be empty
  getAllRegions(countryCode) {
    // return this.http.get(this.apiBaseUrl + 'region/' + countryCode + '/all/?key=' + this.apiKey);
    return this.http.post(`${this.apiBaseUrl}BattutaServices/region/${countryCode}/''/location`, {});
  }

  getAllCities(countryCode, region) {
    // return this.http
    //   .get(this.apiBaseUrl + 'city/' + countryCode + '/search/?region=' + region + '&key=' + this.apiKey);
    return this.http.post(`${this.apiBaseUrl}BattutaServices/city/${countryCode}/${region}/location`, {});
  }

  getCountryByCode(countryCode) {
    return this.http.get(this.apiBaseUrl + 'country/code/' + countryCode + '/?key=' + this.apiKey);
  }
}
