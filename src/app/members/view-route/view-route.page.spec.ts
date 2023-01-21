import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRoutePage } from './view-route.page';

describe('ViewRoutePage', () => {
  let component: ViewRoutePage;
  let fixture: ComponentFixture<ViewRoutePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewRoutePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
