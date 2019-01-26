export interface TeamScore {
  name: string;
  teamId: string;
  score: number;
  playedMatchesCount: number;
  playedMatches: string[];
  ballDifference: number;
}
