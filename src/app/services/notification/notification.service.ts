import { Injectable } from '@angular/core';

import { UserService } from '../user/user.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  notificationCount: number = 0;

  constructor(
    private userService: UserService, 
    private storage: Storage
  ) {

  }

  public getNotificationCount() {
    this.storage.get('UID').then((id) => {
      this.userService.getInvitations(id).subscribe((users) => {
        this.notificationCount = 0;
        console.log('Of user: ', id);
        console.log('Notific service:', users);
        if(users != '') {
          this.notificationCount = Object.keys(users).length;
        }
      }, (err) => {
        console.log(err);
      });
    });
  }
}
