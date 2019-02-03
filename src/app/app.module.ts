import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule} from '@angular/forms'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomMaterialModuleModule } from './custom-material-module/custom-material-module.module';
import { CreateNewTournamtentComponent } from './create-new-tournamtent/create-new-tournamtent.component';
import { AddNewGameComponent } from './add-new-game/add-new-game.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditTeamDialogComponent } from './edit-team-dialog/edit-team-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    CreateNewTournamtentComponent,
    AddNewGameComponent,
    ConfirmDialogComponent,
    EditTeamDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features 
    BrowserAnimationsModule,
    CustomMaterialModuleModule
  ],
  entryComponents: [
    CreateNewTournamtentComponent,
    AddNewGameComponent,
    ConfirmDialogComponent,
    EditTeamDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
