import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoffeeSupplierComponent } from './coffee-supplier.component';

describe('CoffeeSupplierComponent', () => {
  let component: CoffeeSupplierComponent;
  let fixture: ComponentFixture<CoffeeSupplierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoffeeSupplierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoffeeSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
