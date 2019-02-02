import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewTournamtentComponent } from './create-new-tournamtent.component';

describe('CreateNewTournamtentComponent', () => {
  let component: CreateNewTournamtentComponent;
  let fixture: ComponentFixture<CreateNewTournamtentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNewTournamtentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewTournamtentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
