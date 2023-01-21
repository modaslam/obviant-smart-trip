import { Injectable } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavExtrasService {

  extras: any;
  // If route has been set
  routeSetFlag: boolean = false;

  // If route has been set
  tripSetFlag: boolean = false;

  mapLoaded: boolean = true;

  // For storing shared user details
  userSubject: BehaviorSubject<any> = new BehaviorSubject('');
  currentUser: Observable<any> = this.userSubject.asObservable();

  // For different routes in Explore page
  sharedSubject: BehaviorSubject<any> = new BehaviorSubject('');
  currentSubject: Observable<any> = this.sharedSubject.asObservable();

  // For selected route for trip
  selectedRouteSubject: BehaviorSubject<any> = new BehaviorSubject('');
  selectedRoute: Observable<any> = this.selectedRouteSubject.asObservable();

  constructor() { }

  public setExtras(data) {
    this.extras = null;
    this.extras = data;
  }

  public getExtras() {
    return this.extras;
  }

  public setRouteFlag() {
    this.routeSetFlag = true;
  }

  public unsetRouteFlag() {
    this.routeSetFlag = false;
  }

  public getRouteFlag() {
    return this.routeSetFlag;
  }

  public setSharedSubject(data) {
    this.sharedSubject.next(data);
  }

  public setUserSubject(data) {
    this.userSubject.next(data);
  }

  public setSelectedRouteSubject(data) {
    this.selectedRouteSubject.next(data);
  }

  // To set and unset tripSetFlag
  public changeTripFlag(flag) {
    this.tripSetFlag = flag;
  }

}
