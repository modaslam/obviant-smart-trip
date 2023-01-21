import { Injectable } from '@angular/core';

import { AlertController, ToastController,LoadingController } from '@ionic/angular';
/*



See https://angular.io/docs/ts/latest/guide/dependency-injection.html

for more info on providers and Angular 2 DI.

 */
@Injectable( )

export class AlertService {

  loading: any;

  constructor(
    private alertCtrl: AlertController, 
    private toastCtrl: ToastController, 
    private loadingCtrl:LoadingController 
  ) {

    console.log( 'Hello AlertService Provider' );

  }

  async clientAlert( msgTitle:string, subtitle:string ) {

    let alert = await this.alertCtrl.create( {

      header: msgTitle,

      subHeader: subtitle,

      buttons: [ 'ok' ]

    });

    await alert.present();
  }

  async clientToast( message:string ) {

    let toast = await this.toastCtrl.create( {

      message: message,

      duration: 3000

    });
    await toast.present( );
  }

  async errorAlert(message:string = "Unknown Error"){

    let errorAlert = await this.alertCtrl.create( {

      header: 'Error',

      subHeader: message,

      buttons: [ 'ok' ]

    });
    await errorAlert.present( );
  }

  async confirmAlert(title, message, confirmText,confirmHandler,cancelText, cancelHandler){
    let confirm = await this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [
        {
          text: cancelText,
          handler: cancelHandler
        },
        {
          text: confirmText,
          handler: confirmHandler
        }
      ]
    });
    await confirm.present();
  }
  
  async createLoader(message){
    this.loading = await this.loadingCtrl.create({
      message: message, 
      spinner: 'crescent',
    });

    await this.loading.present();
  }

  async dismissLoader() {
    this.loading.dismiss();
  }

}
