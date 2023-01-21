import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TripDetailsPage } from './trip-details.page';
import { ComponentsModule } from '../../components/component.module';

const routes: Routes = [
  {
    path: '',
    component: TripDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TripDetailsPage]
})
export class TripDetailsPageModule {}
