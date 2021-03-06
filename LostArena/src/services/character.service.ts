import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {JWTInterceptor} from '../interceptors/jwtInterceptor';
import {Character, ICharacter} from '../app/models/Character';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {UserState} from '../app/stores/states/user.state';
import {SetCharacters} from '../app/stores/actions/character.actions';
import {DuelLog} from "../classes/duel";

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  selectedCharacter$: Observable<Character>;
  characters$: Observable<Character[]>;

  constructor(private httpClient: HttpClient, private store: Store) {
    this.store.select(UserState.token).subscribe(token => {
      if (token) {
        // this.getMyCharacters().subscribe((characters) => this.store.dispatch(new SetCharacters(characters)));
      }
    });
    this.characters$ = this.store.select(UserState.characters);
    this.selectedCharacter$ = this.store.select(UserState.selectedCharacter);
  }

  getCharacters() {
    return this.httpClient.get<{ amount: number, characters: Character[] }>(environment.api.characters).pipe(
      map(({characters}) => characters)
    );
  }

  getMyCharacters(): Observable<Character[]> {
    return this.httpClient.get<{ characters: Character[] }>(environment.api.character).pipe(
      map(({characters}) => characters)
    );
  }

  createCharacter(characterInfo: Character) {
    return this.httpClient.post(environment.api.character, characterInfo, JWTInterceptor.createHeader());
  }

  startFight(idPlayer: string, idEnemy: string): Observable<DuelLog> {
    return this.httpClient.post<DuelLog>(environment.api.combat, {_idPlayer: idPlayer, _idEnemy: idEnemy}, JWTInterceptor.createHeader());
  }

  startPveFight(idPlayer: string, idMonster: number): Observable<DuelLog> {
    return this.httpClient.post<DuelLog>(environment.api.pve, {id_player: idPlayer, id_monster: idMonster});
  }

}

