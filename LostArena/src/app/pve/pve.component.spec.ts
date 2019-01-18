import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PveComponent } from './pve.component';

describe('PveComponent', () => {
  let component: PveComponent;
  let fixture: ComponentFixture<PveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
