import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TournamentWithId } from '../TournamentWithId';
import { Observable, BehaviorSubject } from 'rxjs';
import { TeamScore } from '../TeamScore';
import { TournamentDataService } from '../tournament-data.service';
import { Match } from '../Match';
import { AddedMatchDto } from '../game-list/AddedMatchDto';
import { EditTeamDialogData } from '../edit-team-dialog/EditTeamDialogData';
import { combineLatest, map } from 'rxjs/operators';

@Component({
  selector: 'app-tournament-detail',
  templateUrl: './tournament-detail.component.html',
  styleUrls: ['./tournament-detail.component.scss']
})
export class TournamentDetailComponent implements OnInit, OnChanges {

  @Input() tournament: TournamentWithId;
  pointSummary$: Observable<TeamScore[]>;
  matchesToPlayFiltered$: Observable<Match[]>;
  matchesToPlayFilter$ = new BehaviorSubject<string>(undefined);

  constructor(private tournamentData: TournamentDataService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tournament) {
      const tournamentId = changes.tournament.currentValue.id;
      this.pointSummary$ = this.tournamentData.getTeamScores(tournamentId);
      const matchesToPlay$ = this.tournamentData.getMatchesToPlayByTournamentId(tournamentId);
      this.matchesToPlayFiltered$ = matchesToPlay$
      .pipe(
        combineLatest(this.matchesToPlayFilter$),
        map(([matches, filter]) => matches
          .filter(m => !filter || m.team1.name.toLowerCase().includes(filter.toLowerCase()) || m.team2.name.toLowerCase().includes(filter.toLowerCase()))
        )
      );


    }
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

  onTeamAdded(teamName: string) {
    this.tournamentData.addTeam(teamName, this.tournament.id);
  }

  onTeamEdited(team: EditTeamDialogData) {
    this.tournamentData.editTeam(team, this.tournament.id);
  }

  removeTeam(teamScore: TeamScore) {
    this.tournamentData.removeTeam(teamScore, this.tournament.id);
  }

  changeNameOfTournament(name: string) {
    this.tournamentData.changeNameOfTournament(name, this.tournament.id);
  }

  changeNumberOfRounds(numberOfRounds: number) {
    this.tournamentData.changeNumberOfRounds(numberOfRounds, this.tournament.id)
  }

}
