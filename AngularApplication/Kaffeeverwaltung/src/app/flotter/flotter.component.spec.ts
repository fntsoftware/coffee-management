import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlotterComponent } from './flotter.component';

describe('FlotterComponent', () => {
  let component: FlotterComponent;
  let fixture: ComponentFixture<FlotterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlotterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlotterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
