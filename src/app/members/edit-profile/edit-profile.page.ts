import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators } from'@angular/forms';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { UserService } from '../../services/user/user.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { PhotoService } from '../../services/photo/photo.service';
import { NavExtrasService } from '../../services/NavExtras/nav-extras.service';
import * as env from '../../../environments/environment';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {

  profileForm: FormGroup;
  userForm: any;
  userDetails: any;

  // Form field patterns
  unamePattern = "^[a-zA-Z_][0-9a-zA-Z_]{5,29}$";
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
  fnamePattern = "^[a-zA-Z. ]+$";
  mnamePattern = "^[a-zA-Z. ]*$";
  lnamePattern = "^[a-zA-Z. ]*$";

  
  constructor(
    public actionSheetController: ActionSheetController,
    public formBuilder: FormBuilder, 
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private storage: Storage,
    private router: Router,
    private photoService: PhotoService,
    private navExtras: NavExtrasService
  ) {
    this.profileForm = this.formBuilder.group({
      username: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.unamePattern) 
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(this.emailPattern)
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
      ]))
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.navExtras.currentUser.subscribe((user) => {
      this.userDetails = user;
      this.userDetails.dateofbirth = this.correctDate(this.userDetails.dateofbirth);
      console.log(this.userDetails.dateofbirth);
      this.profileForm.patchValue({
        username: this.userDetails.username,
        firstName: this.userDetails.firstname,
        middleName: this.userDetails.middlename,
        lastName: this.userDetails.lastname,
        email: this.userDetails.email,
        date: this.userDetails.dateofbirth
      });
    });
  }

  cancel() {
    this.router.navigateByUrl('members/tabs/profile');
  }

  save() {
    
    // Remove previously set user details.
    this.storage.remove('userDetails');
    this.userForm = {
      "firstname": this.profileForm.value.firstName,
      "middlename": this.profileForm.value.middleName,
      "lastname": this.profileForm.value.lastName,
      "dateofbirth": this.profileForm.value.date,
      "username": this.profileForm.value.username,
      "email": this.profileForm.value.email,
    }
    this.authenticationService.patchUser(this.userForm, this.userDetails.id).subscribe((res) => {
      console.log("Patched: ", res);
      this.userService.getUserData(this.userDetails.id).subscribe((user) => {
        // Set newly updated user details.
        this.storage.set("userDetails", user);
        console.log(user);
        this.navExtras.setUserSubject(user);
        this.router.navigate(['members/tabs/profile', {update:'true'}]);
      });
    });
  }

  // For correct date format yyyy-mm-dd from yyyy mm dd
  correctDate(str) {
    return str.split(" ").join("-");
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Upload Profile Picture',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          console.log('Delete clicked');
        }
      }, {
        text: 'Open Camera',
        icon: 'camera',
        handler: () => {
          console.log('Open Camera clicked');
          this.photoService.takePicture(this.photoService.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Load from Gallery',
        icon: 'images',
        handler: () => {
          console.log('Load from Gallery clicked');
          this.photoService.takePicture(this.photoService.camera.PictureSourceType.PHOTOLIBRARY);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

}
