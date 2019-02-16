import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Tournament } from '../Tournament';

@Component({
  selector: 'app-edit-tournament-dialog',
  templateUrl: './edit-tournament-dialog.component.html',
  styleUrls: ['./edit-tournament-dialog.component.scss']
})
export class EditTournamentDialogComponent implements OnInit {
  myForm: FormGroup;
  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTournamentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Tournament) { }

  ngOnInit() {
    this.myForm = this.fb.group({
      name: [this.data.name, [Validators.required]],
      numberOfRounds: [this.data.numberOfRounds, [
        Validators.required,
        Validators.pattern('[1-5]')]]
    });
  }

  get numberOfRounds() {
    return this.myForm.get('numberOfRounds');
  }

  get name() {
    return this.myForm.get('name');
  }

  get numberErrorString() {
    const control = this.myForm.get('numberOfRounds');
    return Object.keys((control.errors || {})).map(key => {
      switch (key) {
        case 'required':
          return 'Måste finnas ett antal';
        case 'pattern':
          return 'Måste vara 1-5';
        default:
          return 'Nått är fel';
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  close() {
    const result: Tournament = {
      name: this.name.value,
      numberOfRounds: this.numberOfRounds.value
    };

    this.dialogRef.close(result);
  }
}
