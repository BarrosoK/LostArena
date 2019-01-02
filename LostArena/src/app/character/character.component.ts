import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ItemService} from '../../services/item.service';
import {IItem} from '../models/Item';
import {CharacterService} from '../../services/character.service';
import {Character} from '../models/Character';
import {Observable, pipe, Subject} from 'rxjs';
import {ObserveOnMessage} from 'rxjs/internal/operators/observeOn';
import {UserState} from '../stores/states/user.state';
import {SetCharacters} from '../stores/actions/character.actions';
import {Store} from '@ngxs/store';
import {CdkDragDrop} from '@angular/cdk/typings/esm5/drag-drop';
import {CdkDrag, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {first} from 'rxjs/operators';
import {ItemComponent} from './item/item.component';
import {MatDialog} from '@angular/material';
import {ItemDialogComponent} from "../shop/item-dialog/item-dialog.component";

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CharacterComponent implements OnInit {

  items: Observable<IItem[]>;
  weapon;
  chest;
  all = [];

  constructor(public characterService: CharacterService, private itemService: ItemService, private store: Store,
              public dialog: MatDialog) {
  }


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

  async equipWeapon(event: CdkDragDrop<IItem>) {
    console.log(event);
    if (event.previousContainer !== event.container) {
      const item = event.item.data[event.previousIndex];
      if (item.type === 1 && item.part === 'weapon') {
        this.weapon = event.item.data[event.previousIndex];
        this.equip(this.weapon._id);
      }
    }
  }

  async equipDrag(event: CdkDragDrop<IItem>) {
    if (event.previousContainer !== event.container) {
      this.equip(event.item.data._id);
    }
  }

  openDialog(item: IItem): void {
    const dialogRef = this.dialog.open(ItemDialogComponent, {
      data: item
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  /** Predicate function that only allows even numbers to be dropped into a list. */
  weaponPredicate(item: CdkDrag<IItem>) {
    return (item.data.part === 'weapon');
  }

  isPart(item: CdkDrag<IItem>, part: string) {
    return (item.data.part === part);
  }

  isChest(item: CdkDrag<IItem>) {
    return (item.data.part === 'chest');
  }

  isHelmet(item: CdkDrag<IItem>) {
    return (item.data.part === 'helmet');
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
      if (!c) {
        return;
      }
      this.items = this.itemService.characterItems(c._id);
      this.items.pipe(first()).subscribe(i => this.all = i);
      this.weapon = c.getWeapon();
      this.chest = c.getEquipment('chest');
      console.log(this.weapon);
    });
  }

  ngOnInit() {
    this.loadItems();
  }


}
