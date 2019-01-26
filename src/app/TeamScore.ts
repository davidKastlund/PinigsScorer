export interface TeamScore {
  name: string;
  teamId: string;
  score: number;
  playedMatchesCount: number;
  gameWinCount: number;
  gameWinOvertimeCount: number;
  gameLoseOvertimeCount: number;
  gameLoseCount: number;
  playedMatches: string[];
  ballDifference: number;
}
