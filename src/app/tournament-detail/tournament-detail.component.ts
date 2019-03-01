import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TournamentWithId } from '../TournamentWithId';
import { Observable, BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { TeamScore } from '../TeamScore';
import { TournamentDataService } from '../tournament-data.service';
import { Match } from '../Match';
import { AddedMatchDto } from '../game-list/AddedMatchDto';
import { EditTeamDto } from '../edit-team-dialog/EditTeamDto';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from '../confirm-dialog/ConfirmDialogData';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Store, select } from '@ngrx/store';
import { State } from './../reducers/index';
import { getMatchesToPlayState, getTeamScoresState } from '../reducers/tournament.reducer';

@Component({
  selector: 'app-tournament-detail',
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.scss']
})
export class TournamentDetailComponent implements OnInit, OnDestroy {


  @Input() tournament: TournamentWithId;
  pointSummary$: Observable<TeamScore[]>;
  matchesToPlayFiltered$: Observable<Match[]>;
  matchesToPlayFilter$ = new BehaviorSubject<string>(undefined);
  seletedTournamentIdSubscription: Subscription;

  constructor(private tournamentData: TournamentDataService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<State>) {
  }

  ngOnInit() {

    const matchesToPlay$ = this.store.pipe(select(getMatchesToPlayState));

    this.matchesToPlayFiltered$ = combineLatest(matchesToPlay$, this.matchesToPlayFilter$)
      .pipe(
        map(([matches, filter]) => matches
          .filter(m => !filter ||
            this.stringContains(m.team1.name, filter) ||
            this.stringContains(m.team2.name, filter))
        )
      );

    this.pointSummary$ = this.store.pipe(select(getTeamScoresState))
      .pipe(
        map(teamScores => teamScores.sort((a: TeamScore, b: TeamScore) => {
          const scoreDiff = b.score - a.score;
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
          const matchDiff = a.playedMatchesCount - b.playedMatchesCount;
          if (matchDiff !== 0) {
            return matchDiff;
          }
          return b.ballDifference - a.ballDifference;
        }))
      );
  }

  ngOnDestroy(): void {
    this.seletedTournamentIdSubscription.unsubscribe();
  }

  private stringContains(str: string, compareStr: string): boolean {
    return !compareStr || str && str.toLowerCase().includes(compareStr.toLowerCase());
  }

  removeMatch(matchId: string) {
    if (!!this.tournament) {
      this.tournamentData.removeMatch(matchId, this.tournament.id);
    }
  }

  addMatch(match: AddedMatchDto) {
    if (!!this.tournament) {
      this.tournamentData.addMatch(match, this.tournament.id);
    }
  }

  // Testing

  onTeamAdded(teamName: string) {
    this.tournamentData.addTeam(teamName, this.tournament.id);
  }

  onTeamEdited(team: EditTeamDto) {
    this.tournamentData.editTeam(team, this.tournament.id);
  }

  removeTeam(teamScore: TeamScore) {
    this.tournamentData.removeTeam(teamScore, this.tournament.id);
  }

  changeNameOfTournament(name: string) {
    this.tournamentData.changeNameOfTournament(name, this.tournament.id);
  }

  changeNumberOfRounds(numberOfRounds: number) {
    this.tournamentData.changeNumberOfRounds(numberOfRounds, this.tournament.id);
  }

  removeTournament() {
    const data = (<ConfirmDialogData>{
      title: 'Vill du ta bort turneringen?'
    });
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '600px', data });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tournamentData.removeTournament(this.tournament.id);
        this.snackBar.open('Turneringen är borttagen!', null, {
          duration: 2000,
        });
      }
    });
  }


  makeTournamentDefault() {
    this.tournamentData.makeTournamentDefault(this.tournament.id).then(() => {
      this.snackBar.open('Inställningen är sparad!', null, {
        duration: 2000,
      });
    });
  }

}
