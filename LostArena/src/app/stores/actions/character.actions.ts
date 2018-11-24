import {Character} from "../../models/character";

export class SetCharacters {
  static readonly type = '[Character] SetCharacters';
  constructor(public characters: Character[]) {}
}

export class AddCharacter {
  static readonly type = '[Character] AddCharacter';
  constructor(public character: Character) {}
}

export class SelectCharacter {
  static readonly type = '[Character] SelectCharacter';
  constructor(public character: Character) {}
}
