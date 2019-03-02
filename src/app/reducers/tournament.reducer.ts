import * as TournamentActions from '../actions/tournament.actions';
import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TournamentWithId } from './../TournamentWithId';
import { MatchWithId } from './../MatchInFireStore';
import { TeamId } from '../TeamId';
import { CombinationHelperService } from './../combination-helper.service';
import { TeamScoreHelperService } from '../team-score-helper.service';

export interface TournamentState {
  tournaments: TournamentWithId[];
  selectedTournamentId: string | null;
  tournamentsContent: {
    [key: string]: { matches: MatchWithId[]; teams: TeamId[] };
  };
}

const initialState: TournamentState = {
  tournaments: [],
  selectedTournamentId: null,
  tournamentsContent: {},
};

const getTournamentFeatureState = createFeatureSelector<TournamentState>(
  'tournaments'
);
export const getAllTournaments = createSelector(
  getTournamentFeatureState,
  state => state.tournaments
);

export const getSelectedTournamentId = createSelector(
  getTournamentFeatureState,
  state => state.selectedTournamentId
);

export const getSelectedTournament = createSelector(
  getTournamentFeatureState,
  getSelectedTournamentId,
  (state, selectedTournamentId) =>
    state.tournaments.find(t => t.id === selectedTournamentId)
);

const getMatches = createSelector(
  getTournamentFeatureState,
  getSelectedTournamentId,
  (state, tournamentId: string) =>
    state.tournamentsContent[tournamentId]
      ? state.tournamentsContent[tournamentId].matches || []
      : []
);

export const getTeams = createSelector(
  getTournamentFeatureState,
  getSelectedTournamentId,
  (state, tournamentId) =>
    state.tournamentsContent[tournamentId]
      ? state.tournamentsContent[tournamentId].teams || []
      : []
);

const getNumberOfRounds = createSelector(
  getSelectedTournament,
  t => t.numberOfRounds
);

export const getMatchesToPlayState = createSelector(
  getMatches,
  getTeams,
  getNumberOfRounds,
  (matches, teams, numberOfRound) => {
    const helper = new TeamScoreHelperService(new CombinationHelperService());
    return helper.getMatchesToPlay(matches, teams, numberOfRound);
  }
);

export const getTeamScoresState = createSelector(
  getMatchesToPlayState,
  getTeams,
  (matchesToPlay, teams) => {
    const helper = new TeamScoreHelperService(new CombinationHelperService());
    return helper.getTeamScores(matchesToPlay, teams);
  }
);

function insertItem(array, item, index) {
  return [...array.slice(0, index), item, ...array.slice(index)];
}

function removeItem(array, index) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

export function reducer(
  state = initialState,
  action: TournamentActions.TournamentActions
): TournamentState {
  switch (action.type) {
    case TournamentActions.TournamentActionTypes.SetSelectTournamentId: {
      return {
        ...state,
        selectedTournamentId: action.payload,
        tournamentsContent: {
          ...state.tournamentsContent,
          [action.payload]: state.tournamentsContent[action.payload] || {teams: [], matches: []}
        }
      };
    }

    case TournamentActions.TournamentActionTypes.LoadSuccess: {
      return {
        ...state,
        tournaments: action.payload,
      };
    }

    case TournamentActions.TournamentActionTypes.AddTournament: {
      return {
        ...state,
        tournaments: insertItem(
          state.tournaments,
          action.payload.tournament,
          action.payload.index
        ),
      };
    }

    case TournamentActions.TournamentActionTypes.RemoveTournament: {
      return {
        ...state,
        tournaments: removeItem(state.tournaments, action.payload),
      };
    }

    case TournamentActions.TournamentActionTypes.ModifyTournament: {
      return {
        ...state,
        tournaments: insertItem(
          removeItem(state.tournaments, action.payload.oldIndex),
          action.payload.tournament,
          action.payload.newIndex
        )
      };
    }

    case TournamentActions.TournamentActionTypes.SetMatchesForTournament: {
      return {
        ...state,
        tournamentsContent: {
          ...state.tournamentsContent,
          [action.payload.tournamentId]: {
            ...state.tournamentsContent[action.payload.tournamentId],
            matches: action.payload.matches
          }
        }
      };
    }

    case TournamentActions.TournamentActionTypes.SetTeamsForTournament: {
      return {
        ...state,
        tournamentsContent: {
          ...state.tournamentsContent,
          [action.payload.tournamentId]: {
            ...state.tournamentsContent[action.payload.tournamentId],
            teams: action.payload.teams
          }
        }
      };
    }

    default: {
      return state;
    }
  }
}
