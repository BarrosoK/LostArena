import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {JWTInterceptor} from '../interceptors/jwtInterceptor';
import {Character} from '../app/models/character';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Store} from '@ngxs/store';
import {UserState} from '../app/stores/states/user.state';
import {SetCharacters} from '../app/stores/actions/character.actions';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  selectedCharacter$: Observable<Character>;
  characters$: Observable<Character[]>;

  constructor(private httpClient: HttpClient, private store: Store) {
    this.store.select(UserState.token).subscribe(token => {
      if (token) {
        this.getMyCharacters().subscribe((characters) => this.store.dispatch(new SetCharacters(characters)));
      }
    });
    this.characters$ = this.store.select(UserState.characters);
    this.selectedCharacter$ = this.store.select(UserState.selectedCharacter);
  }

  getMyCharacters(): Observable<Character[]> {
    return this.httpClient.get<{ characters: Character[] }>(environment.api.characters, JWTInterceptor.createHeader()).pipe(
      map(({characters}) => characters)
    );
  }

  createCharacter(characterInfo: Character) {
    return this.httpClient.post(environment.api.characters, characterInfo, JWTInterceptor.createHeader());
  }
}
