import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewGameComponent } from './add-new-game.component';

describe('AddNewGameComponent', () => {
  let component: AddNewGameComponent;
  let fixture: ComponentFixture<AddNewGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNewGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
