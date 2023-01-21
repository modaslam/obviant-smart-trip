import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { AlertService } from './services/alert/alert.service';
import { TokenInterceptorService } from './services/token-interceptor/token-interceptor.service';
import { JwtInterceptorService } from './services/jwt-interceptor/jwt-interceptor.service';
import { PopoverMenuComponent } from './components/popover-menu/popover-menu.component';
import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
// import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Network } from '@ionic-native/network/ngx';
import { DeviceMotion } from '@ionic-native/device-motion/ngx';

@NgModule({
  declarations: [
    AppComponent, 
    PopoverMenuComponent, 
  ],
  entryComponents: [
    PopoverMenuComponent
  ],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule, 
    HttpClientModule, 
    IonicStorageModule.forRoot(),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AlertService,
    Network,
    {
      provide:HTTP_INTERCEPTORS, useClass: JwtInterceptorService, multi: true
    },
    {
      provide:HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true
    },
    TokenInterceptorService,
    Camera,
    PhotoLibrary,
    File,
    FilePath,
    DeviceMotion
    // WebView
    
  ],
  bootstrap: [AppComponent],
  exports: [PopoverMenuComponent]
})
export class AppModule {}
