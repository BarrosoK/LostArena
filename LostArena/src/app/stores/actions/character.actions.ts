import {Character, ICharacter} from '../../models/Character';

export class SetCharacters {
  static readonly type = '[ICharacter] SetCharacters';
  constructor(public characters: ICharacter[]) {}
}

export class AddCharacter {
  static readonly type = '[ICharacter] AddCharacter';
  constructor(public character: ICharacter) {}
}

export class SelectCharacter {
  static readonly type = '[ICharacter] SelectCharacter';
  constructor(public character: ICharacter) {}
}
