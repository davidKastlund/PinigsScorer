import { DocumentReference } from '@angular/fire/firestore';
export interface MatchInFireStore {
  date: firebase.firestore.Timestamp;
  team1: DocumentReference;
  team2: DocumentReference;
  team1Score: number;
  team2Score: number;
}


export interface MatchWithId {
  id: string;
  date: Date;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
}
