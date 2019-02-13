import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TeamScore } from './../TeamScore';
import { EditTeamDto } from '../edit-team-dialog/EditTeamDto';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EditTeamDialogComponent } from '../edit-team-dialog/edit-team-dialog.component';
import { ConfirmDialogData } from '../confirm-dialog/ConfirmDialogData';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TournamentDataService } from '../tournament-data.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tournament-settings',
  templateUrl: './tournament-settings.component.html',
  styleUrls: ['./tournament-settings.component.scss']
})
export class TournamentSettingsComponent implements OnInit {

  @Input() teams: TeamScore[] = [];
  @Input() tournamentName: string;
  @Input() numberOfRounds: number;

  @Output() teamEdited = new EventEmitter<EditTeamDto>();
  @Output() teamRemoved = new EventEmitter<TeamScore>();
  @Output() teamAdded = new EventEmitter<string>();
  @Output() tournamentNameChanged = new EventEmitter<string>();
  @Output() numberOfRoundsChanged = new EventEmitter<number>();
  @Output() tournamentRemoved = new EventEmitter<void>();
  @Output() tournamentIsDefault = new EventEmitter<void>();

  newTeamName: string;
  isLoggedIn$: Observable<boolean>;

  constructor(private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private tournamentData: TournamentDataService,
    private afAuth: AngularFireAuth) { }

  ngOnInit() {
    this.isLoggedIn$ = this.afAuth.user.pipe(map(u => !!u));
  }


  async startUpdateTeam(team: TeamScore) {
    if (await this.tournamentData.getCanEdit()) {
      const data: EditTeamDto = {
        name: team.name,
        id: team.teamId
      };
      this.dialog.open(EditTeamDialogComponent, { width: '600px', data })
        .afterClosed()
        .subscribe((result: EditTeamDto) => {
          if (!!result) {
            this.teamEdited.emit(result);
          }
        });
    }
  }

  async removeTeam(teamScore: TeamScore) {
    if (await this.tournamentData.getCanEdit()) {

      const data = (<ConfirmDialogData>{
        title: `Vill du ta bort ${teamScore.name}?`
      });
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '600px', data });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.teamRemoved.emit(teamScore);
        }
      });
    }
  }

  async addTeam() {
    if (await this.tournamentData.getCanEdit()) {

      if (!!this.newTeamName && this.newTeamName.length) {
        this.teamAdded.emit(this.newTeamName);
        this.newTeamName = undefined;
      } else {
        this.snackBar.open('Laget måste ha ett namn!', null, {
          duration: 2000,
        });
      }
    }
  }

  async onTournamentNameChanged(name: string) {
    if (!!name) {
      if (await this.tournamentData.getCanEdit()) {
        this.tournamentNameChanged.emit(name);
      }
    }
  }

  async onNumberOfRoundsChanged(numberOfRounds: number) {
    if (numberOfRounds > 0 && numberOfRounds < 6) {
      if (await this.tournamentData.getCanEdit()) {
        this.numberOfRoundsChanged.emit(numberOfRounds);
      }
    }
  }

  async removeTournament() {
    if (await this.tournamentData.getCanEdit()) {
      this.tournamentRemoved.emit();
    }
  }

  async setTournamentAsDefault() {
    if (await this.tournamentData.getCanEdit()) {
      this.tournamentIsDefault.emit();
    }
  }
}

