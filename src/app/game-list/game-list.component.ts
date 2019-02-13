import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Match } from '../Match';
import { ConfirmDialogData } from '../confirm-dialog/ConfirmDialogData';
import { MatDialog } from '@angular/material';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { AddNewGameDialogData } from '../add-new-game/AddNewGameDialogData';
import { AddNewGameComponent } from '../add-new-game/add-new-game.component';
import { AddNewGameDialogResult } from '../add-new-game/AddNewGameDialogResult';
import { AddedMatchDto } from './AddedMatchDto';
import { TournamentDataService } from '../tournament-data.service';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent implements OnInit {

  searchText: string;
  @Output()
  filterChanged = new EventEmitter<string>();
  @Output()
  matchRemoved = new EventEmitter<string>();
  @Output()
  matchAdded = new EventEmitter<AddedMatchDto>();

  @Input()
  matchesToPlay: Match[] = [];

  constructor(private dialog: MatDialog,
    private tournamentService: TournamentDataService) { }

  ngOnInit() {
  }


  async removeMatch(matchId: string) {
    if (await this.tournamentService.getCanEdit()) {
      const data = (<ConfirmDialogData>{
        title: 'Vill du ta bort matchen?',
        okButtonText: 'Ja ta bort matchen',
      });
      const dialogRef = this.dialog.open(ConfirmDialogComponent, { width: '600px', data });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.matchRemoved.emit(matchId);
        }
      });
    }
  }

  async addMatchFromDialog(match: Match) {
    if (await this.tournamentService.getCanEdit()) {
      const dialogData: AddNewGameDialogData = {
        team1Name: match.team1.name,
        team2Name: match.team2.name,
      };
      const dialogRef = this.dialog.open(AddNewGameComponent, { width: '600px', data: dialogData });

      dialogRef.afterClosed().subscribe((result: AddNewGameDialogResult) => {
        if (!!result) {
          const newMatch: AddedMatchDto = {
            team1Id: match.team1Id,
            team2Id: match.team2Id,
            team1Score: result.team1Score,
            team2Score: result.team2Score
          };

          this.matchAdded.emit(newMatch);
        }
      });
    }
  }

}


