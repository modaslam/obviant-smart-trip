import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { AlertService } from '../alert/alert.service';
import { NavExtrasService } from '../NavExtras/nav-extras.service';
import { finalize } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import * as env from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  apiBaseUrl: string = '';
  private userData;

  constructor(
    private platform: Platform, 
    private http: HttpClient, 
    private storage: Storage,
    private file: File,
    private navExtras: NavExtrasService,
    public alertService: AlertService
  ) { 
    this.apiBaseUrl = env.environment.serverUrl;
    this.navExtras.currentUser.subscribe((user) => {
      this.userData = user;
    }, (err) => {
      console.log(err);
    });
  }

  startUpload(filePath) {
    this.file.resolveLocalFilesystemUrl(filePath)
        .then(entry => {
            ( < FileEntry > entry).file(file => this.readFile(file))
        })
        .catch(err => {
            this.alertService.clientToast('Error while reading file.');
        });
  }
 
  readFile(file: any) {
    const reader = new FileReader();
    reader.onloadend = () => {
        const formData = new FormData();
        const imgBlob = new Blob([reader.result], {
            type: file.type
        });
        formData.append('file', imgBlob, file.name);
        this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }
 
  async uploadImageData(formData: FormData) {
    const loading = await this.alertService.createLoader('Uploading image...');
 
    this.http.post(this.apiBaseUrl + 'users/thumbnail/' + this.userData.id, formData)
        .pipe(
            finalize(() => {
                this.alertService.dismissLoader();
            })
        )
        .subscribe(res => {
            if (res['success']) {
              this.alertService.clientToast('File upload complete.')
            } else {
              this.alertService.clientToast('File upload failed.')
            }
        });
  }
}
