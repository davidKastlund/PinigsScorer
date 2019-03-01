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
    loadTournamentsErrorMessage: string;
    matches: MatchWithId[];
    teams: TeamId[];
}

const initialState: TournamentState = {
    tournaments: [],
    selectedTournamentId: null,
    loadTournamentsErrorMessage: '',
    matches: [],
    teams: []
};

const getTournamentFeatureState = createFeatureSelector<TournamentState>('tournaments');
export const getAllTournaments = createSelector(
    getTournamentFeatureState,
    state => state.tournaments);

export const getLoadTournamentsErrorMessage = createSelector(
    getTournamentFeatureState,
    state => state.loadTournamentsErrorMessage
);

export const getSelectedTournamentId = createSelector(
    getTournamentFeatureState,
    state => state.selectedTournamentId);

export const getSelectedTournament = createSelector(
    getTournamentFeatureState,
    getSelectedTournamentId,
    (state, selectedTournamentId) => state.tournaments.find(t => t.id === selectedTournamentId));

const getMatches = createSelector(
    getTournamentFeatureState,
    state => state.matches
);


export const getTeams = createSelector(
    getTournamentFeatureState,
    state => state.teams
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
    return [
        ...array.slice(0, index),
        item,
        ...array.slice(index)
    ];
}

function removeItem(array, index) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
}

export function reducer(state = initialState, action: TournamentActions.TournamentActions): TournamentState {
    switch (action.type) {
        case TournamentActions.TournamentActionTypes.SetSelectTournamentId: {
            return {
                ...state,
                selectedTournamentId: action.payload
            };
        }

        case TournamentActions.TournamentActionTypes.LoadSuccess: {
            return {
                ...state,
                tournaments: action.payload,
                loadTournamentsErrorMessage: ''
            };
        }

        case TournamentActions.TournamentActionTypes.AddTournament: {
            return {
                ...state,
                tournaments: insertItem(state.tournaments, action.payload.tournament, action.payload.index),
                loadTournamentsErrorMessage: ''
            };
        }

        case TournamentActions.TournamentActionTypes.RemoveTournament: {
            return {
                ...state,
                tournaments: removeItem(state.tournaments, action.payload),
                loadTournamentsErrorMessage: ''
            };
        }

        case TournamentActions.TournamentActionTypes.ModifyTournament: {
            return {
                ...state,
                tournaments: insertItem(
                    removeItem(state.tournaments, action.payload.oldIndex),
                    action.payload.tournament,
                    action.payload.newIndex),
                loadTournamentsErrorMessage: ''
            };
        }

        case TournamentActions.TournamentActionTypes.SetMatches: {
            return {
                ...state,
                matches: action.payload
            };
        }

        case TournamentActions.TournamentActionTypes.SetTeams: {
            return {
                ...state,
                teams: action.payload
            };
        }

        case TournamentActions.TournamentActionTypes.LoadFail: {
            return {
                ...state,
                loadTournamentsErrorMessage: action.payload
            };
        }

        default: {
            return state;
        }
    }
}
