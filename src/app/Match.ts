import { Team } from './Team';
export interface Match {
  matchId: string;
  date: Date;
  team1: Team;
  team1Id: string;
  team2: Team;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  isTaken: boolean;
}
