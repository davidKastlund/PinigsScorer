import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { map, combineLatest, tap, take } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatSnackBar, MatDialog, MatBottomSheet } from '@angular/material';
import { Tournament } from "./Tournament";
import { TournamentWithId } from './TournamentWithId';
import { Team } from './Team';
import { Match } from './Match';
import { MatchInFireStore } from './MatchInFireStore';
import { TeamScore } from './TeamScore';
import { GlobalSettings } from './GlobalSettings';
import { GameStats } from './GameStats';
import { CreateNewTournamtentComponent } from './create-new-tournamtent/create-new-tournamtent.component';
import { AddNewGameComponent } from './add-new-game/add-new-game.component';
import { AddNewGameDialogResult } from "./add-new-game/AddNewGameDialogResult";
import { AddNewGameDialogData } from "./add-new-game/AddNewGameDialogData";
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmDialogData } from './confirm-dialog/ConfirmDialogData';
import { EditTeamDialogComponent } from './edit-team-dialog/edit-team-dialog.component';
import { EditTeamDialogData } from './edit-team-dialog/EditTeamDialogData';
import { ScoreTableInfoBottomSheetComponent } from './score-table-info-bottom-sheet/score-table-info-bottom-sheet.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'gisysPingisApp';

  pointSummary$: Observable<TeamScore[]>;
  tournament$: Observable<TournamentWithId>;
  tournamentRef: AngularFirestoreDocument<Tournament>;
  email: string;
  password: string;
  newTeamName: string;
  matchesToPlay$: Observable<Match[]>;
  matchesToPlayFilter$ = new BehaviorSubject<string>(undefined);
  numberOfRounds$ = new BehaviorSubject<number>(1);
  matchesToPlayFiltered$: Observable<Match[]>;
  tournaments$: Observable<TournamentWithId[]>;
  selectedTournamentId$ = new BehaviorSubject<string>("gazBtm1efiIZ91nL5ffk");
  globalSettingsRef: firebase.firestore.DocumentReference;

  constructor(private db: AngularFirestore,
    public afAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) {

    let tournamentsRef = db.collection<Tournament>("tournaments");

    const globalSettings = db.collection<GlobalSettings>("settings").doc("globalSettings");
    this.globalSettingsRef = globalSettings.ref;

    globalSettings.valueChanges()
      .pipe(take(1))
      .subscribe((settings: GlobalSettings) => this.selectedTournamentId$.next(settings.defaultTournamentId));

    this.tournaments$ = tournamentsRef.snapshotChanges()
      .pipe(
        map(actions => actions.map(t => (<TournamentWithId>{
          id: t.payload.doc.id,
          name: t.payload.doc.data().name
        }))
        )
      );


    this.selectedTournamentId$.pipe(
      tap(tournamentId => {
        if (!!tournamentId) {
          this.tournamentRef = db.doc<Tournament>(`/tournaments/${tournamentId}`);
          this.tournament$ = this.tournamentRef.snapshotChanges().pipe(
            map(action => {
              if (!action.payload.exists) {
                return null;
              }
              return {
                id: action.payload.id,
                name: action.payload.data().name,
                numberOfRounds: action.payload.data().numberOfRounds,
              }
            }),
            tap((t: TournamentWithId | null) => {
              t && this.numberOfRounds$.next(t.numberOfRounds)
            })
          );

          let teams$ = this.tournamentRef.collection<Team>("teams").snapshotChanges();

          let matchesRaw$ = this.tournamentRef.collection<MatchInFireStore>('matches').snapshotChanges();

          this.matchesToPlay$ = matchesRaw$.pipe(
            combineLatest(teams$, this.numberOfRounds$),
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

              const allMatches = this.getMatchesToPlay(teamScores, numberOfRounds)

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

          this.matchesToPlayFiltered$ = this.matchesToPlay$
            .pipe(
              combineLatest(this.matchesToPlayFilter$),
              map(([matches, filter]) => matches
                .filter(m => !filter || m.team1.name.toLowerCase().includes(filter.toLowerCase()) || m.team2.name.toLowerCase().includes(filter.toLowerCase()))
              )
            )


          this.pointSummary$ = this.matchesToPlay$.pipe(
            combineLatest(teams$),
            map(([matches, teams]) => {
              let matchesObject = matches
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

                  acc[match.team1Id] = this.getSomething(team1, match.team1Score, match.team2Score, match.matchId);
                  acc[match.team2Id] = this.getSomething(team2, match.team2Score, match.team1Score, match.matchId);

                  return acc;
                }, {});

              teams.forEach(t => {
                matchesObject[t.payload.doc.id] = matchesObject[t.payload.doc.id] || <TeamScore>{
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

              return Object.keys(matchesObject).map(key => matchesObject[key])
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
          )
        }

      })
    ).subscribe();
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

  private getSomething(myTeam: TeamScore, myTeamScore: number, otherTeamsScore: number, matchId: string): TeamScore {
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

  ngOnInit(): void {
  }

  addMatchFromDialog(match: Match) {
    const dialogData: AddNewGameDialogData = {
      team1Name: match.team1.name,
      team2Name: match.team2.name,
    }
    let dialogRef = this.dialog.open(AddNewGameComponent, { width: "600px", data: dialogData });

    dialogRef.afterClosed().subscribe((result: AddNewGameDialogResult) => {
      if (!!result) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp() as firebase.firestore.Timestamp;
        let newMatch: MatchInFireStore = {
          date: timestamp,
          team1: this.tournamentRef.collection("teams").doc(match.team1Id).ref,
          team2: this.tournamentRef.collection("teams").doc(match.team2Id).ref,
          team1Score: result.team1Score,
          team2Score: result.team2Score
        }
        this.tournamentRef.collection("matches").add(newMatch);
        this.snackBar.open("Matchen är tillagd!", null, {
          duration: 2000,
        });
      }
    })
  }

  removeMatch(matchId: string) {
    const data = (<ConfirmDialogData>{
      title: "Vill du ta bort matchen?",
      okButtonText: "Ja ta bort matchen",
    });
    let dialogRef = this.dialog.open(ConfirmDialogComponent, { width: "600px", data });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tournamentRef.collection("matches").doc(matchId).delete();
        this.snackBar.open("Matchen är borttagen!", null, {
          duration: 2000,
        });
      }
    });
  }

  removeTeam(teamScore: TeamScore) {
    const data = (<ConfirmDialogData>{
      title: `Vill du ta bort ${teamScore.name}?`
    });
    let dialogRef = this.dialog.open(ConfirmDialogComponent, { width: "600px", data });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let batch = this.db.firestore.batch();
        batch.delete(this.tournamentRef.collection("teams").doc(teamScore.teamId).ref);

        teamScore.playedMatches.forEach(matchId => {
          batch.delete(this.tournamentRef.collection("matches").doc(matchId).ref);
        })

        batch.commit();

        this.snackBar.open("Laget är borttaget!", null, {
          duration: 2000,
        });
      }
    });
  }

  changeNumberOfRounds(numberOfRounds: number) {
    if (numberOfRounds > 0 && numberOfRounds < 6) {
      this.tournamentRef.update({ numberOfRounds });
      this.snackBar.open("Antal interna möten är uppdaterat är uppdaterat!", null, {
        duration: 2000,
      });
    }
  }

  addTeam() {
    this.tournamentRef.collection<Team>("teams").add({ name: this.newTeamName });
    this.newTeamName = undefined;
    this.snackBar.open("Laget är tillagt!", null, {
      duration: 2000,
    });
  }

  addTournamentFromModal() {
    const dialogRef = this.dialog.open(CreateNewTournamtentComponent, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(newTournamteName => {
      if (!!newTournamteName) {
        this.db.collection<Tournament>("tournaments").add({ name: newTournamteName, numberOfRounds: 1 })
          .then(ref => {
            this.selectedTournamentId$.next(ref.id);
            this.snackBar.open("Turneringen är tillagt!", null, {
              duration: 2000,
            });
          });
      }
    });
  }

  removeTournament(tournament: TournamentWithId) {
    const data = (<ConfirmDialogData>{
      title: "Vill du ta bort turneringen?"
    });
    let dialogRef = this.dialog.open(ConfirmDialogComponent, { width: "600px", data });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedTournamentId$.next(undefined);
        this.db.collection<Tournament>("tournaments").doc(tournament.id).delete();
        this.snackBar.open("Turneringen är borttagen!", null, {
          duration: 2000,
        });
      }
    });
  }

  makeTournamentDefault(tournament: TournamentWithId) {
    this.globalSettingsRef.update(<GlobalSettings>{ defaultTournamentId: tournament.id });
    this.snackBar.open("Inställningen är sparad!", null, {
      duration: 2000,
    });
  }

  startUpdateTeam(team: TeamScore) {
    const data: EditTeamDialogData = {
      name: team.name
    }
    this.dialog.open(EditTeamDialogComponent, {width: "600px", data})
      .afterClosed()
      .subscribe((result: EditTeamDialogData) => {
        if (!!result) {
          this.tournamentRef.collection<Team>("teams").doc(team.teamId).update({ name: result.name });
          this.snackBar.open("Laget är uppdaterat!", null, {
            duration: 2000,
          });
        }
      });
  }

  login() {
    this.afAuth.auth.signInWithEmailAndPassword(this.email, this.password);
  }
  logout() {
    this.afAuth.auth.signOut();
  }

  combinationUtil(arr: string[], data: string[],
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

  getCombinations(arr: string[], n: number, r: number): string[][] {
    let data: string[] = new Array<string>(r);
    let resultArr: string[][] = [];
    this.combinationUtil(arr, data, 0, n - 1, 0, r, resultArr);

    return resultArr;
  }

  getMatchesToPlay(teams: TeamScore[], numberOfRounds: number): Match[] {
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
    matchesEvenlyDiststributed = newLocal.reduce((acc, x) => {
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

  changeNameOfTurnament(name: string) {
    if (!!name) {
      this.tournamentRef.ref.update({ name: name });
      this.snackBar.open("Namnet är ändrat!", null, {
        duration: 2000,
      });
    }
  }
}