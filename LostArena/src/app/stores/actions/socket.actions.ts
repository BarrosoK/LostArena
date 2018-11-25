export class AddMessageSystem {
  static readonly type = '[Socket] AddMessageSystem';
  constructor(public message: string) {}
}

export class RemoveMessageSystem {
  static readonly type = '[Socket] RemoveMessageSystem';
  constructor(public id: string) {}
}
