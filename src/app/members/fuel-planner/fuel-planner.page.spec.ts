import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelPlannerPage } from './fuel-planner.page';

describe('FuelPlannerPage', () => {
  let component: FuelPlannerPage;
  let fixture: ComponentFixture<FuelPlannerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FuelPlannerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuelPlannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
