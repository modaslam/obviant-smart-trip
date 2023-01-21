import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FuelPlannerPage } from './fuel-planner.page';

const routes: Routes = [
  {
    path: '',
    component: FuelPlannerPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FuelPlannerPage]
})
export class FuelPlannerPageModule {}
