import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  notificationCount: number = 0;

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    this.notificationService.getNotificationCount();
  }

  ionViewWillEnter() {

  }

}
