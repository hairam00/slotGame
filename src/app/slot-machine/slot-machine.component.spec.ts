import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotMachineComponent } from './slot-machine.component';

describe('SlotMachineComponent', () => {
  let component: SlotMachineComponent;
  let fixture: ComponentFixture<SlotMachineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlotMachineComponent]
    });
    fixture = TestBed.createComponent(SlotMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
