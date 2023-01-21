import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { NavExtrasService } from '../NavExtras/nav-extras.service';
import * as env from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiBaseUrl: string = '';
  private userData;

  constructor(private http: HttpClient, private navExtras: NavExtrasService) { 
    this.apiBaseUrl = env.environment.serverUrl;
   }

  //  getUserData(userId) {
  //    return this.http.get(this.apiBaseUrl + userId).pipe(
  //     map(res => {
  //     this.userData = res;
  //     console.log("Hello :" + this.userData);
  //     console.log("Hello :" + this.userData.id);
  //     return this.userData;})
  //   );;;
  //  }

  // Get user details
  getUserData(userId) {
    return this.http.get(this.apiBaseUrl + 'users/' + userId)
      .pipe(
        map(res => {
          this.userData = res;
          console.log(this.userData);
          console.log("Helloshhhhh :" + this.userData.id);
          // Assign the value to a BehaviorSubject
          this.navExtras.setUserSubject(this.userData);
          return this.userData;
          })
      );
  }

  findUsersByLocality(country, region, city) {
    return this.http.get(
      this.apiBaseUrl + 'users?filter[where][country.name]=' + country + '&filter[where][region]=' 
      + region + '&filter[where][city]=' + city 
    );
  }

  // To create a new user friendship
  establishFriendship(inviteRequest) {
    console.log('Invitation: ', inviteRequest);
    return this.http.post(this.apiBaseUrl + 'users/' + inviteRequest.userId + '/friendship', inviteRequest);
  }

  // To load existing friendship
  retrieveSpecificFriendship(userId, friendId) {
    return this.http.get(`
      ${this.apiBaseUrl}users/${userId}/friendship?filter={"where":{"friend":{"like":"${friendId}"}}}
    `);
  }

  // To load recieved requests in Notification page
  getInvitations(myId) {
    return this.http.get(`
      ${this.apiBaseUrl}friendships?filter={"where":{"and":[{"friend":{"like":"${myId}"}},{"status":"PENDING"}]}}
    `);
  }

  // To get friend user details
  getOtherUser(friendId) {
    return this.http.get(this.apiBaseUrl + 'users/' + friendId);
  }

  // Remove entry from model
  removeFriendship(friendshipId) {
    return this.http.delete(`
      ${this.apiBaseUrl}friendships/${friendshipId}
    `);
  }

  updateFriendship(userId, friendshipId, update) {
    return this.http.put(`${this.apiBaseUrl}users/${userId}/friendship/${friendshipId}`, update)
  }

  // Retrieve all friends of a user
  getFriends(userId) {
    return this.http.get(`
      ${this.apiBaseUrl}users/${userId}/friendship?filter={"where":{"status":"FRIEND"}}
    `);
  }

  // Obtain the progress of a user such as experience, level and distance travelled.
  getUserProgress(userId) {
    return this.http.get(`${this.apiBaseUrl}users/${userId}/progress`);
  }

  updateUserProgress(userId, update) {
    return this.http.put(`${this.apiBaseUrl}users/${userId}/progress`, update);
  }

  // Get paginated query response for progress of users, 20 at a time
  getAllProgress(page) {
    return this.http.get(`${this.apiBaseUrl}progresses?filter[limit]=${page.limit}
                                                      &filter[skip]=${page.skip}
                                                      &filter[order]=experience%20DESC`);
  }

  getLevelInfo(level) {
    return this.http.get(`${this.apiBaseUrl}levels?filter={"where":{"level":"${level}"}}`);
  }

}
