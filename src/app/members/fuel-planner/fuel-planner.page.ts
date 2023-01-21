import { Component, OnInit } from '@angular/core';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-fuel-planner',
  templateUrl: './fuel-planner.page.html',
  styleUrls: ['./fuel-planner.page.scss'],
})
export class FuelPlannerPage implements OnInit {

  mileage: number;
  totalFuel: number;
  distanceCovered: number;

  constructor(private storage: Storage) { }

  ngOnInit() {
  }

  calculate() {
    this.distanceCovered = this.totalFuel * this.mileage;
  }

  store() {
    this.storage.set('mileage', this.mileage);
    this.storage.set('fuel', this.totalFuel);
  }

}
