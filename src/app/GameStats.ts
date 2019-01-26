export class GameStats {
  readonly wins: number;
  readonly loses: number;
  readonly overtimeWins: number;
  readonly overtimeLoses: number;
  constructor(myScore: number, otherTeamsScore: number) {
    const isWinner = myScore > otherTeamsScore;
    const isOvertime = myScore > 11 || otherTeamsScore > 11;
    this.wins = isWinner && !isOvertime ? 1 : 0;
    this.loses = !isWinner && !isOvertime ? 1 : 0;
    this.overtimeWins = isWinner && isOvertime ? 1 : 0;
    this.overtimeLoses = !isWinner && isOvertime ? 1 : 0;
  }
}
