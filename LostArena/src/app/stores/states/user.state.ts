import {Action, Select, Selector, State, StateContext} from '@ngxs/store';
import {AuthService} from '../../../services/auth.service';
import {SetSession, SetToken, SetUser} from '../actions/user.actions';
import {Observable} from 'rxjs';
import {Character} from '../../models/character';
import {AddCharacter, SelectCharacter, SetCharacters} from '../actions/character.actions';

export interface UserStateModel {
  token: string;
  user: any;
  selectedCharacter: Character;
  characters: Character[];
}​

@State<UserStateModel>({
  name: 'user',
  defaults: {
    token: null,
    user: null,
    selectedCharacter: null,
    characters: null
  }
})
export class UserState {
  constructor() {}

  @Selector()
  static token(state: UserStateModel) {
    return state.token;
  }

  @Selector()
  static user(state: UserStateModel) {
    return state.user;
  }

  @Selector()
  static characters(state: UserStateModel) {
    return state.characters;
  }

  @Selector()
  static selectedCharacter(state: UserStateModel) {
    return state.selectedCharacter;
  }

  @Action(SelectCharacter)
  selectCharacter({getState, patchState}: StateContext<UserStateModel>, {character}: SelectCharacter) {
    const state = getState();
    patchState({
      selectedCharacter: character
    });
  }

  @Action(SetCharacters)
  setCharacters({getState, patchState}: StateContext<UserStateModel>, {characters}: SetCharacters) {
    const state = getState();
    patchState({
      characters: characters
    });
  }

  @Action(AddCharacter)
  addCharacter({getState, patchState}: StateContext<UserStateModel>, {character}: AddCharacter) {
    const state = getState();
    patchState({
      characters: [...state.characters, character]
    });
  }

  @Action(SetToken)
  setToken(ctx: StateContext<UserStateModel>, {token}: SetToken) {
    const state = ctx.getState();
    ctx.patchState({
      token: token
    });
  }

  @Action(SetUser)
  setUser(ctx: StateContext<UserStateModel>, {user}: SetUser) {
    const state = ctx.getState();
    ctx.patchState({
      user: user
    });
  }

  @Action(SetSession)
  setSession(ctx: StateContext<UserStateModel>, {token, user}: SetSession) {
    const state = ctx.getState();
    ctx.patchState({
      token: token,
      user: user
    });
  }

}


