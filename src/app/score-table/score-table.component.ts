import { Component, OnInit, Input } from '@angular/core';
import { ScoreTableInfoBottomSheetComponent } from '../score-table-info-bottom-sheet/score-table-info-bottom-sheet.component';
import { MatBottomSheet } from '@angular/material';
import { TeamScore } from './../TeamScore';

@Component({
  selector: 'app-score-table',
  templateUrl: './score-table.component.html',
  styleUrls: ['./score-table.component.scss']
})
export class ScoreTableComponent implements OnInit {

  @Input()
  teams: TeamScore[] = [];

  constructor(private bottomSheet: MatBottomSheet) { }

  ngOnInit() {
  }

  openScoreTableInfo() {
    this.bottomSheet.open(ScoreTableInfoBottomSheetComponent);
  }

}
