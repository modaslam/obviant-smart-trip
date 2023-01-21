import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs.page';
// import { MemberRoutingModule } from '../member-routing.module';
import { TabsRouterModule } from './tabs.router.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsRouterModule,
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
