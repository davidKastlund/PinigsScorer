import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-create-new-tournamtent',
  templateUrl: './create-new-tournamtent.component.html',
  styleUrls: ['./create-new-tournamtent.component.scss']
})
export class CreateNewTournamtentComponent implements OnInit {

  name: string;

  constructor(public dialogRef: MatDialogRef<CreateNewTournamtentComponent>) { }

  ngOnInit() {
  }

  cancelDialog() {
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close(this.name);
  }

}
