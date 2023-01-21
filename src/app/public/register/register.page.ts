import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators } from'@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration/registration.service';
import { ActionSheetController } from '@ionic/angular';
import { AutocompleteBattutaService } from '../../services/autocomplete-battuta/autocomplete-battuta.service';
import { ConnectivityService } from '../../services/connectivity/connectivity.service';
import { AlertService } from '../../services/alert/alert.service';
import { count } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup;
  userForm: any;
  countries: any[] = [];
  regions: any = [];
  cities: any = [];
  selectedCountryCode: string;

  // Form field patterns
  unamePattern = '^[a-zA-Z_][0-9a-zA-Z_]{5,29}$';
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';
  pwdPattern = '^[a-zA-Z0-9@*!$%=_# ]{6,30}$';
  fnamePattern = '^[a-zA-Z. ]+$';
  mnamePattern = '^[a-zA-Z. ]*$';
  lnamePattern = '^[a-zA-Z. ]*$';

  constructor(
    public formBuilder: FormBuilder, 
    public registrationService: RegistrationService,
    public actionSheetController: ActionSheetController,
    public connectivityService: ConnectivityService,
    public alertService: AlertService,
    private router: Router,
    private autocompleteBattuta: AutocompleteBattutaService,
  ) {
    this.registerForm = this.formBuilder.group({
      username: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.unamePattern) 
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.emailPattern)
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.pwdPattern)
      ])),
      confirmPassword: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.pwdPattern),
      ])),
      firstName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.fnamePattern)
      ])),
      middleName: new FormControl('', Validators.compose([
        Validators.pattern(this.mnamePattern)
      ])),
      lastName: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.lnamePattern)
      ])),
      date: new FormControl('', Validators.compose([
        Validators.required
      ])),
      gender: new FormControl('', Validators.compose([
        Validators.required
      ])),
      country: new FormControl('', Validators.compose([
        Validators.required
      ])),
      region: new FormControl('', Validators.compose([
        Validators.required
      ])),
      city: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
    
  }

  ngOnInit() {
    
  }

  ionViewWillEnter() {
    if(this.connectivityService.isOnline()) {
      console.log('network connected!');
      let countriesData;
      this.autocompleteBattuta.getAllCountries().subscribe((countries) => {
        console.log('Countries are: ', countries);
        countriesData = countries;

        this.countries = countriesData.data;
      });
      if(this.alertService.loading) {
        this.alertService.dismissLoader();
      }
    }
    else {
      console.log('No internet connection!');
      this.alertService.createLoader('Network disconnected!');
    }

    this.addConnectivityListeners();
  }

  ionViewWillLeave() {
    if(this.alertService.loading) {
      this.alertService.dismissLoader();
    }
  }

  addConnectivityListeners(): void {
    let countriesData;
    this.connectivityService.watchOnline().subscribe(() => {
      setTimeout(() => {
        console.log('network connected!');
        this.autocompleteBattuta.getAllCountries().subscribe((data) => {
          countriesData = data;
          this.countries = countriesData.data;
        });
        if(this.alertService.loading) {
          this.alertService.dismissLoader();
        }
      }, 2000);
    });

    this.connectivityService.watchOffline().subscribe(() => {
      console.log('No internet connection!');
      this.alertService.createLoader('Network disconnected!');
    });
  }

  register() {

    // this.capitalizeNames();
    console.log("Username: " + this.registerForm.value.username);
    console.log("Email: " + this.registerForm.value.email);
    console.log("Password: " + this.registerForm.value.password);
    console.log("Confirm Password: " + this.registerForm.value.confirmPassword);
    console.log("First Name: " + this.registerForm.value.firstName);
    console.log("Middle Name: " + this.registerForm.value.middleName);
    console.log("Last Name: " + this.registerForm.value.lastName);
    console.log("Date: " + this.registerForm.value.date);
    console.log("Gender: " + this.registerForm.value.gender);
    console.log("Country: " + this.registerForm.value.country);
    console.log("Region: " + this.registerForm.value.region);
    console.log("City: " + this.registerForm.value.city);

    this.userForm = {
      "firstname": this.registerForm.value.firstName,
      "middlename": this.registerForm.value.middleName,
      "lastname": this.registerForm.value.lastName,
      "dateofbirth": this.registerForm.value.date,
      "gender": this.registerForm.value.gender,
      "country": this.registerForm.value.country,
      "region": this.registerForm.value.region,
      "city": this.registerForm.value.city,
      "realm": "string",
      "username": this.registerForm.value.username,
      "email": this.registerForm.value.email,
      "emailVerified": false,
      "password": this.registerForm.value.password
    }

    console.log(this.userForm);

    this.registrationService.registerUser(this.userForm).then(data => {
      console.log(data);
      this.router.navigateByUrl('/login');
    }, err => {
      console.log(err);
    });

  }

  // To capitalize names
  capitalizeNames() {

    // Capitalizing First Name.
    let tempString = this.registerForm.value.firstName;
    tempString = tempString.toLowerCase();
    this.registerForm.value.firstName = tempString.charAt(0).toUpperCase() + tempString.slice(1);

    // Capitalizing Middle Name if it exists.
    tempString = this.registerForm.value.middleName;
    if(tempString !== '') {
      tempString = tempString.toLowerCase();
      this.registerForm.value.middleName = tempString.charAt(0).toUpperCase() + tempString.slice(1);
    }

    // Capitalizing Last Name
    tempString = this.registerForm.value.lastName;
    tempString = tempString.toLowerCase();
    this.registerForm.value.lastName = tempString.charAt(0).toUpperCase() + tempString.slice(1);
  }

  updateRegions() {
    console.log('Country code: ', this.registerForm.value.country.code);
    this.selectedCountryCode = this.registerForm.value.country.code;
    let newRegions;
    this.autocompleteBattuta.getAllRegions(this.registerForm.value.country.code).subscribe((regions) => {
      console.log("Regions: ", regions);
      newRegions = regions;
      this.regions = newRegions.data;
      this.formatRegions();
      this.registerForm.value.region = '';
      this.cities = [];
      this.registerForm.value.city = '';
    });
  }

  updateCities() {
    console.log('Region: ', this.registerForm.value.region);
    let newCities;
    this.autocompleteBattuta.getAllCities(this.selectedCountryCode, this.registerForm.value.region).subscribe((cities) => {
      newCities = cities;
      this.cities = newCities.data;
    });
  }

  formatRegions() {
    for(let i = 0; i < this.regions.length; i++) {
      if(this.regions[i].region.indexOf('National Capital Territory of ') > -1) {
        this.regions[i].region = this.regions[i].region.slice(30);
      } 
      else if(this.regions[i].region.indexOf('State of ') > -1) {
        this.regions[i].region = this.regions[i].region.slice(9);
      } 
      else if(this.regions[i].region.indexOf('Union Territory of ') > -1) {
        this.regions[i].region = this.regions[i].region.slice(19);
      } 
      else
        continue;
    }
  }

}
