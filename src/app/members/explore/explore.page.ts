import { Component, OnInit, ViewChild } from '@angular/core';

import { TripService } from '../../services/trip/trip.service';
import { AlertService } from '../../services/alert/alert.service';
import { IonInfiniteScroll } from '@ionic/angular';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
})
export class ExplorePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  page: any;
  routes: any;
  moreRoutes: any[];
  durations: any = [];
  // To determine if page is visited or not
  visitedFlag: boolean = false;

  constructor(
    private tripService: TripService, 
    private navExtras: NavExtrasService,
    private router: Router,
    private alertService: AlertService
  ) {
    this.page = {
      'limit': 5,
      'skip': 0
    }
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadMoreRoutes(null);
    this.visitedFlag = true;
  }

  loadMoreRoutes(event) {
    if(event == null) {
      this.page = {
        'limit': 5,
        'skip': 0
      }
      this.moreRoutes = [];
    }
    else {
      this.page.limit += 5;
      this.page.skip += 5;
    }
    this.tripService.getAllRoutes(this.page).subscribe((routes) => {
      for(let i in routes) {
        this.moreRoutes = this.moreRoutes.concat(routes[i]);
        this.secondsToHms(routes[i].duration);
      }

      if(event != null) {
        event.target.complete();
      }

      if(Object.keys(routes).length < 5) {
        if(event == null) {
          this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
        }
        else {
          event.target.disabled = true;
        }
        this.alertService.clientToast('No more routes!');
      }
    }, (err) => {
      console.log(err);
    });
  }

  viewRoute(route) {
    this.navExtras.setSharedSubject(route);
    this.router.navigate(['members/view-route']);
  }

  secondsToHms(d) {
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? ' hr, ' : ' hrs, ') : '';
    let mDisplay = m > 0 ? m + (m == 1 ? ' min ' : ' mins ') : '';
    // let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    // return hDisplay + mDisplay + sDisplay; 
    this.durations.push(hDisplay + mDisplay);
    console.log(this.durations);
  }
}
