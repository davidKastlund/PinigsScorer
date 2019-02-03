import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTableInfoBottomSheetComponent } from './score-table-info-bottom-sheet.component';

describe('ScoreTableInfoBottomSheetComponent', () => {
  let component: ScoreTableInfoBottomSheetComponent;
  let fixture: ComponentFixture<ScoreTableInfoBottomSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreTableInfoBottomSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreTableInfoBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
