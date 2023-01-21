import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from'@angular/forms';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import { AlertService } from '../../services/alert/alert.service';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { TripService } from '../../services/trip/trip.service';
import { TimelineComponent, TimelineItemComponent, TimelineTimeComponent } from '../../components/timeline/timeline.component';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.page.html',
  styleUrls: ['./trip-details.page.scss'],
})
export class TripDetailsPage implements OnInit {

  routeNamePattern = "^[a-zA-Z. ]{6,40}$";

  details: any;
  userId: string;
  totalWaypoints = null;
  nameSet = null;
  routeDetails: any;
  trip: any;
  tripDetailsForm: FormGroup;
  duration: any;

  constructor(
    public formBuilder: FormBuilder, 
    private activatedRoute: ActivatedRoute,
    private navExtras: NavExtrasService,
    public alertService: AlertService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private tripService: TripService
  ) {

    this.tripDetailsForm = this.formBuilder.group({
      routeName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.routeNamePattern) 
      ]))
    });
   }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    // To obtained parameters passed through url.
    this.totalWaypoints = this.activatedRoute.snapshot.paramMap.get('waypoints');
    this.userId = this.authenticationService.getUserId();
    this.details = this.navExtras.getExtras();
    // To convert seconds to hours and minutes.
    this.duration = this.secondsToHms(this.details.duration);
    if(!this.navExtras.getRouteFlag()) {
      // Adds source to beginning of array
      this.details.waypoints.unshift(this.details.source);
      // Adds destination to end of array
      this.details.waypoints.push(this.details.destination);
    }
  }

  // this.addRoute();

  addRoute() {

    this.routeDetails = {
      "name": this.tripDetailsForm.value.routeName,
      "distance": this.details.distance,
      "legs": this.details.legs,
      "overviewPolyline": this.details.overviewPolyline,
      "latlngPolyline": this.details.latlngPolyline,
      "duration": this.details.duration,
      "waypoints": this.details.waypoints,
      "userId": this.userId
    }

    console.log('route info', this.routeDetails);
    console.log('passed data', this.details);
    console.log('uSER ID ', this.userId);

    this.tripService.addRoute(this.routeDetails).subscribe((res) => {
      console.log("Added Route: ", res);
      
      // For storing data to be passed to another page
      this.navExtras.setSharedSubject(res);
      this.navExtras.setRouteFlag();
    });

    // Method to continue to fuel planner or straight to user invitation.
    this.continue();
  }

  secondsToHms(d) {
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    let hDisplay = h > 0 ? h + (h == 1 ? ' hour, ' : ' hours, ') : '';
    let mDisplay = m > 0 ? m + (m == 1 ? ' minute ' : ' minutes ') : '';
    // let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    // return hDisplay + mDisplay + sDisplay; 
    return hDisplay + mDisplay;
  }

  continue() {
    this.alertService.confirmAlert(
      'Continue to Fuel Planner?', 
      'Press \'Yes\' to continue to fuel planner and \'No\' to continue without.',
      'Yes',
      () => {
        // Navigate to fuel planner
        this.router.navigateByUrl('members/fuel-planner');

      },
      'No',
      () => {
        // Navigate to people
        this.router.navigateByUrl('members/tabs/people');
      }
    );
  }

}
