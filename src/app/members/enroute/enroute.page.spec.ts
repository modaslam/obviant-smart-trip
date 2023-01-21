import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnroutePage } from './enroute.page';

describe('EnroutePage', () => {
  let component: EnroutePage;
  let fixture: ComponentFixture<EnroutePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnroutePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnroutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
