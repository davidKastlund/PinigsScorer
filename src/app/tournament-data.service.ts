import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentChangeAction } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material';
import { Tournament } from './Tournament';
import { AddedMatchDto } from './game-list/AddedMatchDto';
import * as firebase from 'firebase/app';
import { MatchInFireStore } from './MatchInFireStore';
import { EditTeamDialogData } from './edit-team-dialog/EditTeamDialogData';
import { Team } from './Team';
import { TeamScore } from './TeamScore';
import { Observable, combineLatest } from 'rxjs';
import { Match } from './Match';
import { map } from 'rxjs/operators';
import { GameStats } from './GameStats';
import { CombinationHelperService } from './combination-helper.service';

@Injectable({
  providedIn: 'root'
})
export class TournamentDataService {

  constructor(private db: AngularFirestore,
    private snackBar: MatSnackBar,
    private combinationHelper: CombinationHelperService) { }

  removeMatch(matchId: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    tournament.collection('matches').doc(matchId).delete();
    this.snackBar.open('Matchen är borttagen!', null, {
      duration: 2000,
    });
  }

  addMatch(addedMatch: AddedMatchDto, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    const timestamp = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
    const newMatch: MatchInFireStore = {
      date: timestamp,
      team1: tournament.collection('teams').doc(addedMatch.team1Id).ref,
      team2: tournament.collection('teams').doc(addedMatch.team2Id).ref,
      team1Score: addedMatch.team1Score,
      team2Score: addedMatch.team2Score
    };
    tournament.collection('matches').add(newMatch);
    this.snackBar.open('Matchen är tillagd!', null, {
      duration: 2000,
    });
  }



  addTeam(teamName: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.collection<Team>('teams').add({ name: teamName });
    this.snackBar.open('Laget är tillagt!', null, {
      duration: 2000,
    });
  }

  editTeam(team: EditTeamDialogData, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.collection<Team>('teams').doc(team.id).update({ name: team.name });
    this.snackBar.open('Laget är uppdaterat!', null, {
      duration: 2000,
    });
  }

  removeTeam(teamScore: TeamScore, tournamentId: string) {

    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);


    const batch = this.db.firestore.batch();
    batch.delete(tournament.collection('teams').doc(teamScore.teamId).ref);

    teamScore.playedMatches.forEach(matchId => {
      batch.delete(tournament.collection('matches').doc(matchId).ref);
    });

    batch.commit();

    this.snackBar.open('Laget är borttaget!', null, {
      duration: 2000,
    });
  }

  changeNameOfTournament(name: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.ref.update({ name: name });
    this.snackBar.open('Namnet är ändrat!', null, {
      duration: 2000,
    });
  }

  changeNumberOfRounds(numberOfRounds: number, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    tournament.update({ numberOfRounds });
    this.snackBar.open('Antal interna möten är uppdaterat är uppdaterat!', null, {
      duration: 2000,
    });
  }

  private getAllMatchesToPlay(teams: DocumentChangeAction<Team>[], numberOfRounds: number): Match[] {
    const teamIds = teams.map(t => t.payload.doc.id);
    const resultArr = this.combinationHelper.getCombinations(teamIds, 2);
    let matchesEvenlyDiststributed = [];

    const playedMostByTeamId = teamIds.reduce((acc, t) => {
      acc[t] = 0;
      return acc;
    }, {});

    for (let i = 0; i < resultArr.length; i++) {
      const nextMatch = resultArr
        .filter(m => !matchesEvenlyDiststributed.some(am => am[0] === m[0] && am[1] === m[1]))
        .sort((a, b) => {
          const aPlayedWeight = playedMostByTeamId[a[0]] + playedMostByTeamId[a[1]];
          const bPlayedWeight = playedMostByTeamId[b[0]] + playedMostByTeamId[b[1]];
          return aPlayedWeight - bPlayedWeight;
        })[0];

      playedMostByTeamId[nextMatch[0]] = playedMostByTeamId[nextMatch[0]] + 1;
      playedMostByTeamId[nextMatch[1]] = playedMostByTeamId[nextMatch[1]] + 1;

      matchesEvenlyDiststributed.push(nextMatch);
    }

    const newLocal = Array.from({ length: numberOfRounds }, (v, k) => k + 1);
    matchesEvenlyDiststributed = newLocal.reduce((acc) => {
      return acc.concat(matchesEvenlyDiststributed);
    }, []);

    return matchesEvenlyDiststributed.map(matchArr => {
      const match: Match = {
        team1: teams.find(t => t.payload.doc.id === matchArr[0]).payload.doc.data(),
        team2: teams.find(t => t.payload.doc.id === matchArr[1]).payload.doc.data(),
        team1Score: 0,
        team2Score: 0,
        matchId: undefined,
        team1Id: matchArr[0],
        team2Id: matchArr[1],
        date: undefined,
        isTaken: false
      };
      return match;
    });


  }


  getMatchesToPlayByTournamentId(tournamentId: string): Observable<Match[]> {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    const teamActions$ = tournament.collection<Team>('teams').snapshotChanges();
    const matchActions$ = tournament.collection<MatchInFireStore>('matches').snapshotChanges();
    const numberOfRounds$ = tournament.valueChanges().pipe(map(t => t.numberOfRounds));

    const matchesToPlay$: Observable<Match[]> = combineLatest(matchActions$, teamActions$, numberOfRounds$).pipe(
      map(([matchActions, teamActions, numberOfRounds]) => {
        const allMatches = this.getAllMatchesToPlay(teamActions, numberOfRounds);

        const playedMatches = matchActions
          .filter(m => !!m.payload.doc.data().date)
          .sort((b, a) => {
            const aDate = a.payload.doc.data().date.toDate();
            const bDate = b.payload.doc.data().date.toDate();

            return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
          })
          .map(matchAction => {
            const m = matchAction.payload.doc.data();
            const team1 = teamActions.find(t => t.payload.doc.id === m.team1.id);
            const team2 = teamActions.find(t => t.payload.doc.id === m.team2.id);

            return Object.assign({}, m, <Match>{
              matchId: matchAction.payload.doc.id,
              team1: team1 && team1.payload.doc.data(),
              team1Id: team1 && team1.payload.doc.id,
              team2: team2 && team2.payload.doc.data(),
              team2Id: team2 && team2.payload.doc.id,
              date: m.date && m.date.toDate()
            });
          })
          .filter(m => !!m.team1)
          .filter(m => !!m.team2);

        return allMatches.map(m => {
          const playedMatch = playedMatches.find(pm => pm.team1Id === m.team1Id && pm.team2Id === m.team2Id && !pm.isTaken);
          if (!!playedMatch) {
            playedMatch.isTaken = true;
          }
          return playedMatch || m;
        });
      }
      )
    );

    return matchesToPlay$;
  }

  getTeamScores(tournamentId: string): Observable<TeamScore[]> {
    const tournamentDoc = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    const teams$ = tournamentDoc.collection<Team>('teams').snapshotChanges();
    const matchesToPlay$ = this.getMatchesToPlayByTournamentId(tournamentId);

    return combineLatest(matchesToPlay$, teams$).pipe(
      map(([matchesToPlay, teamActions]) => {
        const initialTeamScoresByTeamId = teamActions.reduce((acc, teamAction) => {
          acc[teamAction.payload.doc.id] = this.createEmptyTeamScore(teamAction.payload.doc.data().name, teamAction.payload.doc.id);
          return acc;
        }, {});

        const playedMatches = matchesToPlay
          .filter(m => !!m.matchId);

        const teamScoresByTeamId = playedMatches
          .reduce((acc, match) => {
            acc[match.team1Id] = this.getNewTeamScoreFromMatch(acc[match.team1Id], match.team1Score, match.team2Score, match.matchId);
            acc[match.team2Id] = this.getNewTeamScoreFromMatch(acc[match.team2Id], match.team2Score, match.team1Score, match.matchId);

            return acc;
          }, initialTeamScoresByTeamId);

        return Object.values(teamScoresByTeamId);
      })
    );
  }

  private createEmptyTeamScore(teamName: string, teamId: string): TeamScore {
    return {
      name: teamName,
      teamId: teamId,
      score: 0,
      playedMatchesCount: 0,
      gameWinCount: 0,
      gameWinOvertimeCount: 0,
      gameLoseOvertimeCount: 0,
      gameLoseCount: 0,
      playedMatches: [],
      ballDifference: 0
    };
  }

  private getNewTeamScoreFromMatch(myTeam: TeamScore, myTeamScore: number, otherTeamsScore: number, matchId: string): TeamScore {
    const gameStats = new GameStats(myTeamScore, otherTeamsScore);

    const newTeamScore: TeamScore = {
      teamId: myTeam.teamId,
      name: myTeam.name,
      score: myTeam.score + this.getPointsForTeam(myTeamScore, otherTeamsScore),
      playedMatchesCount: myTeam.playedMatchesCount + 1,
      gameWinCount: myTeam.gameWinCount + gameStats.wins,
      gameWinOvertimeCount: myTeam.gameWinOvertimeCount + gameStats.overtimeWins,
      gameLoseOvertimeCount: myTeam.gameLoseOvertimeCount + gameStats.overtimeLoses,
      gameLoseCount: myTeam.gameLoseCount + gameStats.loses,
      playedMatches: myTeam.playedMatches.concat(matchId),
      ballDifference: myTeam.ballDifference + this.getBollDifference(myTeamScore, otherTeamsScore)
    };

    return newTeamScore;
  }

  private getPointsForTeam(myScore: number, otherTeamsScore: number): number {
    const isWinner = myScore > otherTeamsScore;
    const isOvertime = myScore > 11 || otherTeamsScore > 11;
    const winnerPoints = isOvertime ? 2 : 3;
    const loserPoints = isOvertime ? 1 : 0;
    return isWinner ? winnerPoints : loserPoints;
  }


  private getBollDifference(myScore: number, otherTeamsScore: number): number {
    return myScore - otherTeamsScore;
  }
}
