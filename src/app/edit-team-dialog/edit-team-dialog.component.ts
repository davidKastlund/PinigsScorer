import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditTeamDialogData } from './EditTeamDialogData';

@Component({
  selector: 'app-edit-team-dialog',
  templateUrl: './edit-team-dialog.component.html',
  styleUrls: ['./edit-team-dialog.component.scss']
})
export class EditTeamDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTeamDialogData) { }

  ngOnInit() {
  }

  onSave() {
    const editedTeam: EditTeamDialogData = {
      name: this.data.name,
      id: this.data.id
    }

    this.dialogRef.close(editedTeam);
  }
}