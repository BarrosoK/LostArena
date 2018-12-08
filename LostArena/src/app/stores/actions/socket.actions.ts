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
