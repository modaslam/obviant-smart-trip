import { Injectable } from '@angular/core';

import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { Observable } from 'rxjs';

declare var Connection;

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {

  onDevice: boolean;

  constructor(public network: Network, public platform: Platform) {
    this.onDevice = this.platform.is('cordova');
  }

  isOnline(): boolean {
    if(this.onDevice && this.network.type) {
      console.log('Nav2 value is ', navigator.onLine);
      console.log('Network type:', this.network.type);
      console.log('On Device:', this.onDevice);
      return this.network.type != 'none';
    } 
    else {
      console.log('Browser Navigator value is ', navigator.onLine);
      return navigator.onLine;
    }
  }

  isOffline(): boolean {
    if(this.onDevice && this.network.type) {
      return this.network.type == 'none';
    }
    else {
      return !navigator.onLine;
    }
  }

  watchOnline(): any {
    return this.network.onConnect();
  }

  watchOffline(): any {
    return this.network.onDisconnect();
  }
}
