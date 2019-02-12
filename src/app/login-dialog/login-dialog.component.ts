import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  email: string;
  password: string;

  constructor(private afAuth: AngularFireAuth,
    private dialogRef: MatDialogRef<LoginDialogComponent>) { }

  ngOnInit() {
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password)
      .then(x => {
        this.dialogRef.close(x.user);
      })
      .catch(reason => alert(reason));
  }
}
