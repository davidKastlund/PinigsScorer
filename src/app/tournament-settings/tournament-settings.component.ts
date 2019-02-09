import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TeamScore } from './../TeamScore';
import { EditTeamDialogData } from '../edit-team-dialog/EditTeamDialogData';
import { MatDialog, MatSnackBar } from '@angular/material';
import { EditTeamDialogComponent } from '../edit-team-dialog/edit-team-dialog.component';
import { ConfirmDialogData } from '../confirm-dialog/ConfirmDialogData';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tournament-settings',
  templateUrl: './tournament-settings.component.html',
  styleUrls: ['./tournament-settings.component.scss']
})
export class TournamentSettingsComponent implements OnInit {

  @Input() teams: TeamScore[] = [];
  @Input() tournamentName: string;
  @Input() numberOfRounds: number;

  @Output() teamEdited = new EventEmitter<EditTeamDialogData>();
  @Output() teamRemoved = new EventEmitter<TeamScore>();
  @Output() teamAdded = new EventEmitter<string>();
  @Output() tournamentNameChanged = new EventEmitter<string>();
  @Output() numberOfRoundsChanged = new EventEmitter<number>();

  newTeamName: string;

  constructor(private dialog: MatDialog,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
  }


  startUpdateTeam(team: TeamScore) {
    const data: EditTeamDialogData = {
      name: team.name,
      id: team.teamId
    };
    this.dialog.open(EditTeamDialogComponent, { width: '600px', data })
      .afterClosed()
      .subscribe((result: EditTeamDialogData) => {
        if (!!result) {
          this.teamEdited.emit(result);
        }
      });
  }

  removeTeam(teamScore: TeamScore) {
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

  addTeam() {
    if (!!this.newTeamName && this.newTeamName.length) {
      this.teamAdded.emit(this.newTeamName);
      this.newTeamName = undefined;
    } else {
      this.snackBar.open('Laget måste ha ett namn!', null, {
        duration: 2000,
      });
    }
  }

  onTournamentNameChanged(name: string) {
    if (!!name) {
      this.tournamentNameChanged.emit(name);
    }
  }

  onNumberOfRoundsChanged(numberOfRounds: number) {
    if (numberOfRounds > 0 && numberOfRounds < 6) {
      this.numberOfRoundsChanged.emit(numberOfRounds);
    }
  }
}

