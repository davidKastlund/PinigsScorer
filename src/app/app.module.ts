import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
import { ScoreTableInfoBottomSheetComponent } from './score-table-info-bottom-sheet/score-table-info-bottom-sheet.component';
import { ScoreTableComponent } from './score-table/score-table.component';
import { GameListComponent } from './game-list/game-list.component';
import { TournamentSettingsComponent } from './tournament-settings/tournament-settings.component';
import { TournamentDetailComponent } from './tournament-detail/tournament-detail.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { EditTournamentDialogComponent } from './edit-tournament-dialog/edit-tournament-dialog.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { StoreModule } from '@ngrx/store';
import { reducers, metaReducers } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TournamentEffects } from './tournament.effects';

@NgModule({
  declarations: [
    AppComponent,
    CreateNewTournamtentComponent,
    AddNewGameComponent,
    ConfirmDialogComponent,
    EditTeamDialogComponent,
    ScoreTableInfoBottomSheetComponent,
    ScoreTableComponent,
    GameListComponent,
    TournamentSettingsComponent,
    TournamentDetailComponent,
    LoginDialogComponent,
    EditTournamentDialogComponent,
    SidenavComponent,
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
    CustomMaterialModuleModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot([TournamentEffects]),
    StoreDevtoolsModule.instrument({
      name: 'pingisApp demo app devtools',
      maxAge: 25,
      logOnly: environment.production
    })
  ],
  entryComponents: [
    CreateNewTournamtentComponent,
    AddNewGameComponent,
    ConfirmDialogComponent,
    EditTeamDialogComponent,
    ScoreTableInfoBottomSheetComponent,
    LoginDialogComponent,
    EditTournamentDialogComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
