import { Component, OnInit } from '@angular/core';
import {ItemService} from '../../services/item.service';
import {IItem} from '../models/Item';
import {CharacterService} from '../../services/character.service';
import {Character} from '../models/Character';
import {Observable, Subject} from 'rxjs';
import {ObserveOnMessage} from 'rxjs/internal/operators/observeOn';
import {UserState} from '../stores/states/user.state';
import {SetCharacters} from '../stores/actions/character.actions';
import {Store} from '@ngxs/store';
import {CdkDragDrop} from '@angular/cdk/typings/esm5/drag-drop';
import {CdkDrag, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss']
})
export class CharacterComponent implements OnInit {

  items: Observable<IItem[]>;

  constructor(public characterService: CharacterService, private itemService: ItemService, private store: Store) {
  }

  all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  even = [10];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  /** Predicate function that only allows even numbers to be dropped into a list. */
  evenPredicate(item: CdkDrag<number>) {
    return item.data % 2 === 0;
  }

  /** Predicate function that doesn't allow items to be dropped into a list. */
  noReturnPredicate() {
    return false;
  }

  async equip(itemId) {
    const c = await this.store.selectOnce(UserState.selectedCharacter).toPromise();
    const r = await this.itemService.equip(itemId, c._id).toPromise();
  }

  async throwItem(itemId) {
    const c = await this.store.selectOnce(UserState.selectedCharacter).toPromise();
    const r = await this.itemService.throwItem(itemId, c._id).toPromise();
    console.log(r);
  }

  loadItems() {
     this.characterService.selectedCharacter$.subscribe((c) => {
       if (!c) { return; }
       this.items = this.itemService.characterItems(c._id);
     });
  }

  ngOnInit() {
    this.loadItems();
  }

}
