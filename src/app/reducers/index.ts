import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as tournamentReducer from './tournament.reducer';

export interface State {
  tournaments: tournamentReducer.TournamentState;
}

export const reducers: ActionReducerMap<State> = {
  tournaments: tournamentReducer.reducer
};


export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
