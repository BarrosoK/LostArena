export class AddMessageSystem {
  static readonly type = '[Socket] AddMessageSystem';
  constructor(public message: string) {}
}
