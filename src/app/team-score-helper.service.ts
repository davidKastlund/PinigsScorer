import { Injectable } from '@angular/core';
import { Match } from './Match';
import { TeamId } from './TeamId';
import { TeamScore } from './TeamScore';
import { GameStats } from './GameStats';
import { MatchWithId } from './MatchInFireStore';
import { CombinationHelperService } from './combination-helper.service';
import { Team } from './Team';

@Injectable({
  providedIn: 'root'
})
export class TeamScoreHelperService {

  constructor(private combinationHelper: CombinationHelperService) { }


  getTeamScores(matchesToPlay: Match[], teams: TeamId[]): TeamScore[] {
    const initialTeamScoresByTeamId = teams.reduce((acc, team) => {
      acc[team.id] = this.createEmptyTeamScore(team.name, team.id);
      return acc;
    }, {});

    const teamScoresByTeamId = matchesToPlay
      .filter(m => !!m.matchId)
      .reduce((acc, match) => {
        acc[match.team1Id] = this.getNewTeamScoreFromMatch(acc[match.team1Id], match.team1Score, match.team2Score, match.matchId);
        acc[match.team2Id] = this.getNewTeamScoreFromMatch(acc[match.team2Id], match.team2Score, match.team1Score, match.matchId);

        return acc;
      }, initialTeamScoresByTeamId);

    return Object.values(teamScoresByTeamId);
  }


  getMatchesToPlay(matches: MatchWithId[], teams: TeamId[], numberOfRounds: number): Match[]{
    const allMatchesToPlay = this.getAllMatchesToPlayNew(teams, numberOfRounds);
        const playedMatches = this.getPlayedMatchesNew(matches, teams);

        return allMatchesToPlay.map(matchToPlay => {
          const playedMatch = playedMatches.find(pm =>
            pm.team1Id === matchToPlay.team1Id &&
            pm.team2Id === matchToPlay.team2Id &&
            !pm.isTaken);

          if (!!playedMatch) {
            playedMatch.isTaken = true;
          }
          return playedMatch || matchToPlay;
        });
  }

  private getAllMatchesToPlayNew(teams: TeamId[], numberOfRounds: number): Match[] {
    const teamIds = teams.map(t => t.id);
    const teamIdCombinations = this.combinationHelper.getAllPossibleCombinationsEvenlyDistributed(teamIds, numberOfRounds);

    return teamIdCombinations.map(matchArr => {
      const team1Id = matchArr[0];
      const team2Id = matchArr[1];
      const match: Match = {
        team1: teams.find(t => t.id === team1Id),
        team2: teams.find(t => t.id === team2Id),
        team1Score: 0,
        team2Score: 0,
        matchId: undefined,
        team1Id: team1Id,
        team2Id: team2Id,
        date: undefined,
        isTaken: false
      };
      return match;
    });
  }

  private getPlayedMatchesNew(matches: MatchWithId[], teams: TeamId[]) {
    return matches
      .filter(m => !!m.date)
      .sort((b, a) => {
        const aDate = a.date;
        const bDate = b.date;
        return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
      })
      .map(m => {
        const team1 = <Team>teams.find(t => t.id === m.team1Id);
        const team2 = <Team>teams.find(t => t.id === m.team2Id);
        return Object.assign({}, m, <Match>{
          matchId: m.id,
          team1: team1,
          team1Id: m.team1Id,
          team2: team2 ,
          team2Id: m.team2Id,
          date: m.date
        });
      })
      .filter(m => !!m.team1 && !!m.team2);
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
