export class SetSession {
  static readonly type = '[User] SetSession';
  constructor(public token: string, public user: any) {}
}

export class SetToken {
  static readonly type = '[User] SetToken';
  constructor(public token: string) {}
}

export class SetUser {
  static readonly type = '[User] SetUser';
  constructor(public user: any) {}
}
