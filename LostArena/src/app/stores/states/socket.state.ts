import {Action, Select, Selector, State, StateContext} from '@ngxs/store';
import {AddMessageSystem} from '../actions/socket.actions';

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

  @Action(AddMessageSystem)
  addMessageSystem({getState, patchState}: StateContext<SocketStateModel>, {message}: AddMessageSystem) {
    const state = getState();
    state.sysMessages.push(message);
    return state;
  }
}


