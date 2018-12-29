import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Character} from '../app/models/Character';
import {environment} from '../environments/environment';
import {map} from 'rxjs/operators';
import {IItem} from '../app/models/Item';
import {Select, Store} from '@ngxs/store';
import {UserState} from '../app/stores/states/user.state';
import {Observable} from 'rxjs';
import {RequestOptions} from "@angular/http";

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  @Select(UserState.selectedCharacter) selectedCharacter: Observable<Character>;

  constructor(private http: HttpClient, private store: Store) { }

  getItems() {
    return this.http.get<{items: IItem[]}>(environment.api.items).pipe(
      map(({items}) => items)
    );
  }

  characterItems(characterId) {
    return this.http.get<{items: IItem[]}>(environment.api.character + '/' + characterId + '/item').pipe(
      map(({items}) => items)
    );
  }

    equip(itemId, characterId) {
    return this.http.post(environment.api.character + '/equip', {itemId: itemId, characterId: characterId});
  }

  buy(itemId: number, characterId) {
    return this.http.post(environment.api.character + '/item', {itemId: itemId, characterId: characterId});
  }

  throwItem(itemId: string, characterId: string) {
    return this.http.request('DELETE', environment.api.items, {
      body: { itemId: itemId, characterId: characterId }
    });
  }
}
