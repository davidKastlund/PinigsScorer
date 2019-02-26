import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AddNewGameDialogData } from './AddNewGameDialogData';
import { AddNewGameDialogResult } from './AddNewGameDialogResult';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-add-new-game',
  templateUrl: './add-new-game.component.html',
  styleUrls: ['./add-new-game.component.scss']
})
export class AddNewGameComponent implements OnInit {
  myForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<AddNewGameComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddNewGameDialogData,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.myForm = this.fb.group({
      team1Score: [undefined, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]],
      team2Score: [undefined, [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]
      ],
    }, { validator: this.mustWinWithTwo('team1Score', 'team2Score') });
  }

  mustWinWithTwo(score1Key: string, score2Key: string): ValidatorFn {
    return (group: FormGroup): { [key: string]: any } | null => {
      const score1Control = group.controls[score1Key];
      const team1Score: number = +score1Control.value;
      const score2Control = group.controls[score2Key];
      const team2Score: number = +score2Control.value;

      const scores = [team1Score, team2Score];
      const bothHasMoreThan8 = scores.every(v => v > 8);
      const failed = bothHasMoreThan8 ? Math.abs(team1Score - team2Score) !== 2 : !scores.includes(11);
      return failed ? { 'mustWinWithTwo': { team1Score, team2Score } } : null;
    };
  }

  get showPingisRuleErrorMessage() {
    return this.team1Score.touched &&
      this.team1Score.valid &&
      this.team2Score.touched &&
      this.team2Score.valid &&
      this.myForm.errors &&
      this.myForm.errors.mustWinWithTwo;
  }

  get team1Score() {
    return this.myForm.get('team1Score');
  }

  private getErrorsFromFormControl(formControl: AbstractControl) {
    const errors = formControl.errors || {};
    return Object.keys(errors).map(e => {
      switch (e) {
        case 'min':
          return `Får inte vara mindre än ${errors[e].min}`;
        case 'required':
          return 'Får inte vara tomt';
        case 'pattern':
          return 'Måste vara ett positivt heltal';
        default:
          return 'Nått är fel';
      }
    }).join(', ');
  }

  get team1ScoreErrors() {
    return this.getErrorsFromFormControl(this.team1Score);
  }

  get team2Score() {
    return this.myForm.get('team2Score');
  }

  get team2ScoreErrors() {
    return this.getErrorsFromFormControl(this.team2Score);
  }


  close() {
    const result: AddNewGameDialogResult = this.myForm.value;
    this.dialogRef.close(result);
  }

  cancel() {
    this.dialogRef.close();
  }
}
