import {CharacterChat} from "../../models/Character";

export class AddMessageSystem {
  static readonly type = '[Socket] AddMessageSystem';
  constructor(public message: string) {}
}

export class RemoveMessageSystem {
  static readonly type = '[Socket] RemoveMessageSystem';
  constructor(public id: string) {}
}

export class AddMessageCombat {
  static readonly type = '[Socket] AddMessageCombat';
  constructor(public message: string) {}
}

export class RemoveMessageCombat {
  static readonly type = '[Socket] RemoveMessageCombat';
  constructor(public id: string) {}
}

export class AddChatRoom {
  static readonly type = '[Socket] AddChatRoom';
  constructor(public payload: CharacterChat) {}
}

export class RemoveChatRoom {
  static readonly type = '[Socket] RemoveChatRoom';
  constructor(public payload) {}
}
