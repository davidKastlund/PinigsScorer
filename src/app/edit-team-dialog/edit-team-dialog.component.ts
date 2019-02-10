import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EditTeamDto } from './EditTeamDialogData';

@Component({
  selector: 'app-edit-team-dialog',
  templateUrl: './edit-team-dialog.component.html',
  styleUrls: ['./edit-team-dialog.component.scss']
})
export class EditTeamDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditTeamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTeamDto) { }

  ngOnInit() {
  }

  onSave() {
    const editedTeam: EditTeamDto = {
      name: this.data.name,
      id: this.data.id
    };

    this.dialogRef.close(editedTeam);
  }
}
