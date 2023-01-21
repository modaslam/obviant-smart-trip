import { Injectable } from '@angular/core';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Platform } from '@ionic/angular';
import { FileService } from '../file/file.service';
import { AlertService } from '../alert/alert.service';
import * as env from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  apiBaseUrl: string = '';

  constructor(
    public camera: Camera, 
    private photoLibrary: PhotoLibrary,
    private filePath: FilePath,
    private file: File,
    private platform: Platform,
    private fileService: FileService,
    private alertService: AlertService
  ) {
    this.apiBaseUrl = env.environment.serverUrl;
  }

  takePicture(sourceType: PictureSourceType) {
    const options: CameraOptions = {
      quality: 100,
      sourceType: sourceType,
      // destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      allowEdit: true,
      cameraDirection: this.camera.Direction.FRONT
    }

    this.camera.getPicture(options).then(imagePath => {
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this.filePath.resolveNativePath(imagePath)
              .then(filePath => {
                  this.fileService.startUpload(filePath);
              });
      } else {
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          // this.copyFileToLocalDir(correctPath, currentName, this.createFileName());
      }
  });
  }

  createFileName() {
    var d = new Date(),
        n = d.getTime(),
        newFileName = n + ".jpg";
    return newFileName;
  }

}