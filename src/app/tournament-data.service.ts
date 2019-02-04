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
import { Observable } from 'rxjs';
import { Match } from './Match';
import { map, combineLatest } from 'rxjs/operators';
import { GameStats } from './GameStats';

@Injectable({
  providedIn: 'root'
})
export class TournamentDataService {

  constructor(private db: AngularFirestore,
    private snackBar: MatSnackBar) { }

  removeMatch(matchId: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    tournament.collection("matches").doc(matchId).delete();
    this.snackBar.open("Matchen är borttagen!", null, {
      duration: 2000,
    });
  }

  addMatch(addedMatch: AddedMatchDto, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    const timestamp = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
    let newMatch: MatchInFireStore = {
      date: timestamp,
      team1: tournament.collection("teams").doc(addedMatch.team1Id).ref,
      team2: tournament.collection("teams").doc(addedMatch.team2Id).ref,
      team1Score: addedMatch.team1Score,
      team2Score: addedMatch.team2Score
    }
    tournament.collection("matches").add(newMatch);
    this.snackBar.open("Matchen är tillagd!", null, {
      duration: 2000,
    });
  }



  addTeam(teamName: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.collection<Team>("teams").add({ name: teamName });
    this.snackBar.open("Laget är tillagt!", null, {
      duration: 2000,
    });
  }

  editTeam(team: EditTeamDialogData, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.collection<Team>("teams").doc(team.id).update({ name: team.name });
    this.snackBar.open("Laget är uppdaterat!", null, {
      duration: 2000,
    });
  }

  removeTeam(teamScore: TeamScore, tournamentId: string) {

    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);


    let batch = this.db.firestore.batch();
    batch.delete(tournament.collection("teams").doc(teamScore.teamId).ref);

    teamScore.playedMatches.forEach(matchId => {
      batch.delete(tournament.collection("matches").doc(matchId).ref);
    })

    batch.commit();

    this.snackBar.open("Laget är borttaget!", null, {
      duration: 2000,
    });
  }

  changeNameOfTournament(name: string, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);

    tournament.ref.update({ name: name });
    this.snackBar.open("Namnet är ändrat!", null, {
      duration: 2000,
    });
  }

  changeNumberOfRounds(numberOfRounds: number, tournamentId: string) {
    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    tournament.update({ numberOfRounds });
    this.snackBar.open("Antal interna möten är uppdaterat är uppdaterat!", null, {
      duration: 2000,
    });
  }

  private combinationUtil(arr: string[], data: string[],
    start: number, end: number,
    index: number, r: number, resultArr: string[][]) {
    // Current combination is  
    // ready to be printed,  
    // print it 
    if (index == r) {
      resultArr.push(Object.assign([], data));
      return;
    }

    // replace index with all 
    // possible elements. The  
    // condition "end-i+1 >=  
    // r-index" makes sure that  
    // including one element 
    // at index will make a  
    // combination with remaining  
    // elements at remaining positions
    for (let i = start; i <= end && end - i + 1 >= r - index; i++) {
      data[index] = arr[i];
      this.combinationUtil(arr, data, i + 1, end, index + 1, r, resultArr);
    }
  }

  private getCombinations(arr: string[], n: number, r: number): string[][] {
    let data: string[] = new Array<string>(r);
    let resultArr: string[][] = [];
    this.combinationUtil(arr, data, 0, n - 1, 0, r, resultArr);

    return resultArr;
  }

  private getAllMatchesToPlay(teams: TeamScore[], numberOfRounds: number): Match[] {
    let teamsArr = [];
    for (let i = 0; i < teams.length; i++) {
      teamsArr[i] = teams[i].teamId;
    }
    let r = 2;
    let n = teamsArr.length;
    let resultArr = this.getCombinations(teamsArr, n, r);
    let matchesEvenlyDiststributed = [];

    let playedMostByTeamId = teamsArr.reduce((acc, t) => {
      acc[t] = 0;
      return acc;
    }, {})

    for (let i = 0; i < resultArr.length; i++) {
      let nextMatch = resultArr
        .filter(m => !matchesEvenlyDiststributed.some(am => am[0] === m[0] && am[1] === m[1]))
        .sort((a, b) => {
          let aPlayedWeight = playedMostByTeamId[a[0]] + playedMostByTeamId[a[1]];
          let bPlayedWeight = playedMostByTeamId[b[0]] + playedMostByTeamId[b[1]];
          return aPlayedWeight - bPlayedWeight;
        })[0];

      playedMostByTeamId[nextMatch[0]] = playedMostByTeamId[nextMatch[0]] + 1;
      playedMostByTeamId[nextMatch[1]] = playedMostByTeamId[nextMatch[1]] + 1;

      matchesEvenlyDiststributed.push(nextMatch);
    }

    const newLocal = Array.from({ length: numberOfRounds }, (v, k) => k + 1);;
    matchesEvenlyDiststributed = newLocal.reduce((acc) => {
      return acc.concat(matchesEvenlyDiststributed);
    }, []);

    return matchesEvenlyDiststributed.map(matchArr => {
      let match: Match = {
        team1: teams.find(t => t.teamId === matchArr[0]),
        team2: teams.find(t => t.teamId === matchArr[1]),
        team1Score: 0,
        team2Score: 0,
        matchId: undefined,
        team1Id: matchArr[0],
        team2Id: matchArr[1],
        date: undefined,
        isTaken: false
      }
      return match;
    })
  
  
  }


getMatchesToPlayByTournamentId(tournamentId: string) : Observable<Match[]> {
  const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
  let teams$ = tournament.collection<Team>("teams").snapshotChanges();

  let matchesToPlay$ = this.getMatchesToPlayForTournament(tournament, teams$);

  return matchesToPlay$;
}

  getTeamScores(tournamentId: string): Observable<TeamScore[]> {

    const tournament = this.db.doc<Tournament>(`/tournaments/${tournamentId}`);
    let teams$ = tournament.collection<Team>("teams").snapshotChanges();


    const matchesToPlay$ = this.getMatchesToPlayForTournament(tournament, teams$);
    const teamScores = matchesToPlay$.pipe(
      combineLatest(teams$),
      map(([matches, teams]) => {
        let teamScoresByTeamId = matches
          .filter(m => !!m.matchId)
          .reduce((acc, match: Match) => {
            let team1: TeamScore = acc[match.team1Id] || {
              name: match.team1.name,
              teamId: match.team1Id,
              score: 0,
              playedMatchesCount: 0,
              playedMatches: [],
              gameWinCount: 0,
              gameWinOvertimeCount: 0,
              gameLoseOvertimeCount: 0,
              gameLoseCount: 0,
              ballDifference: 0
            };

            let team2: TeamScore = acc[match.team2Id] || {
              name: match.team2.name,
              teamId: match.team2Id,
              score: 0,
              playedMatchesCount: 0,
              gameWinCount: 0,
              gameWinOvertimeCount: 0,
              gameLoseOvertimeCount: 0,
              gameLoseCount: 0,
              playedMatches: [],
              ballDifference: 0
            };

            acc[match.team1Id] = this.getNewTeamScoreFromMatch(team1, match.team1Score, match.team2Score, match.matchId);
            acc[match.team2Id] = this.getNewTeamScoreFromMatch(team2, match.team2Score, match.team1Score, match.matchId);

            return acc;
          }, {});

        teams.forEach(t => {
          teamScoresByTeamId[t.payload.doc.id] = teamScoresByTeamId[t.payload.doc.id] || <TeamScore>{
            name: t.payload.doc.data().name,
            score: 0,
            playedMatches: [],
            gameWinCount: 0,
            gameWinOvertimeCount: 0,
            gameLoseOvertimeCount: 0,
            gameLoseCount: 0,
            ballDifference: 0,
            teamId: t.payload.doc.id,
            playedMatchesCount: 0
          };
        })

        return Object.keys(teamScoresByTeamId).map(key => teamScoresByTeamId[key])
          .sort((a, b) => {
            const scoreDiff = b.score - a.score;
            if (scoreDiff !== 0) {
              return scoreDiff;
            }
            const matchDiff = a.playedMatchesCount - b.playedMatchesCount;
            if (matchDiff !== 0) {
              return matchDiff;
            }
            return b.ballDifference - a.ballDifference;
          });
      })
    );

    return teamScores;
  }

  private getNewTeamScoreFromMatch(myTeam: TeamScore, myTeamScore: number, otherTeamsScore: number, matchId: string): TeamScore {
    const gameStats = new GameStats(myTeamScore, otherTeamsScore);

    let newTeamScore: TeamScore = {
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
    let isWinner = myScore > otherTeamsScore;
    let isOvertime = myScore > 11 || otherTeamsScore > 11;
    let winnerPoints = isOvertime ? 2 : 3;
    let loserPoints = isOvertime ? 1 : 0
    return isWinner ? winnerPoints : loserPoints;
  }


  private getBollDifference(myScore: number, otherTeamsScore: number): number {
    return myScore - otherTeamsScore;
  }


  private getMatchesToPlayForTournament(tournament: AngularFirestoreDocument<Tournament>,
    teams$: Observable<DocumentChangeAction<Team>[]>): Observable<Match[]> {
    let matchesRaw$ = tournament.collection<MatchInFireStore>('matches').snapshotChanges();
    const numberOfRounds$ = tournament.valueChanges().pipe(map(t => t.numberOfRounds));

    const matchesToPlay$: Observable<Match[]> = matchesRaw$.pipe(
      combineLatest(teams$, numberOfRounds$),
      map(([matches, teams, numberOfRounds]) => {
        let teamScores = teams.map(t => {
          let team: TeamScore =
          {
            teamId: t.payload.doc.id,
            name: t.payload.doc.data().name,
            score: 0,
            playedMatchesCount: 0,
            gameWinCount: 0,
            gameWinOvertimeCount: 0,
            gameLoseOvertimeCount: 0,
            gameLoseCount: 0,
            ballDifference: 0,
            playedMatches: []
          }
          return team;
        });

        const allMatches = this.getAllMatchesToPlay(teamScores, numberOfRounds)

        const playedMatches = matches.map(action => {
          let m = action.payload.doc.data();
          let team1 = teams.find(t => t.payload.doc.id == m.team1.id)
          let team2 = teams.find(t => t.payload.doc.id == m.team2.id)

          return Object.assign({}, m, <Match>{
            matchId: action.payload.doc.id,
            team1: team1 && team1.payload.doc.data(),
            team1Id: team1 && team1.payload.doc.id,
            team2: team2 && team2.payload.doc.data(),
            team2Id: team2 && team2.payload.doc.id,
            date: m.date && m.date.toDate()
          })
        })
          .filter(m => !!m.team1)
          .filter(m => !!m.team2);

        return allMatches.map(m => {
          let playedMatch = playedMatches.find(pm => pm.team1Id === m.team1Id && pm.team2Id === m.team2Id && !pm.isTaken);
          if (!!playedMatch) {
            playedMatch.isTaken = true;
          }
          return playedMatch || m
        })
      }
      )
    );

    return matchesToPlay$;
  }

}
