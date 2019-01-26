import { DocumentReference } from '@angular/fire/firestore';
export interface MatchInFireStore {
  date: firebase.firestore.Timestamp;
  team1: DocumentReference;
  team2: DocumentReference;
  team1Score: number;
  team2Score: number;
}
