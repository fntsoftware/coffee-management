import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonStatisticComponent } from './person-statistic.component';

describe('PersonStatisticComponent', () => {
  let component: PersonStatisticComponent;
  let fixture: ComponentFixture<PersonStatisticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonStatisticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
