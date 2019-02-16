import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTournamentDialogComponent } from './edit-tournament-dialog.component';

describe('EditTournamentDialogComponent', () => {
  let component: EditTournamentDialogComponent;
  let fixture: ComponentFixture<EditTournamentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTournamentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTournamentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
