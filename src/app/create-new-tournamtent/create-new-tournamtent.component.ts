import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-new-tournamtent',
  templateUrl: './create-new-tournamtent.component.html',
  styleUrls: ['./create-new-tournamtent.component.scss']
})
export class CreateNewTournamtentComponent implements OnInit {

  myForm: FormGroup;
  constructor(public dialogRef: MatDialogRef<CreateNewTournamtentComponent>,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.myForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  cancelDialog() {
    this.dialogRef.close();
  }

  get name() {
    return this.myForm.get('name');
  }

  closeDialog() {
    this.dialogRef.close(this.name.value);
  }
}
