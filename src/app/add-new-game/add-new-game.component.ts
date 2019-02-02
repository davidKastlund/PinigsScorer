import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddNewGameDialogData } from './AddNewGameDialogData';

export interface AddNewGameDialogResult {
  team1Score: number,
  team2Score: number
}

@Component({
  selector: 'app-add-new-game',
  templateUrl: './add-new-game.component.html',
  styleUrls: ['./add-new-game.component.scss']
})
export class AddNewGameComponent implements OnInit {
  team1Score: number;
  team2Score: number;

  constructor(public dialogRef: MatDialogRef<AddNewGameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddNewGameDialogData) { }

  ngOnInit() {
  }

  close() {
    const result: AddNewGameDialogResult = {
      team1Score: this.team1Score,
      team2Score: this.team2Score
    }
    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close();
  }
}
