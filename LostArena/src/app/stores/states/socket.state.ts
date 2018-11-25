import {Action, Select, Selector, State, StateContext} from '@ngxs/store';
import {AddMessageSystem, RemoveMessageSystem} from '../actions/socket.actions';

export interface SocketStateModel {
  sysMessages: string[];
}​

@State<SocketStateModel>({
  name: 'socket',
  defaults: {
    sysMessages: [],
  }
})
export class SocketState {
  constructor() {}

  @Selector()
  static sysMessages(state: SocketStateModel) {
    return state.sysMessages;
  }

  @Action(RemoveMessageSystem)
  removeMessageSystem({getState, patchState}: StateContext<SocketStateModel>, {id}: RemoveMessageSystem) {
    const state = getState();
    patchState({
      sysMessages: state.sysMessages.filter((msg, i) => {
        return i !== +id;
      })
    });
  }

  @Action(AddMessageSystem)
  addMessageSystem({getState, patchState}: StateContext<SocketStateModel>, {message}: AddMessageSystem) {
    const state = getState();
    patchState({
      sysMessages: [message, ...state.sysMessages]
    });
  }
}


