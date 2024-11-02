import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PondListComponent } from './pond-list.component';

describe('PondListComponent', () => {
  let component: PondListComponent;
  let fixture: ComponentFixture<PondListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PondListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PondListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
