import {Component, Input, OnInit} from '@angular/core';
import {CharacterService} from '../../../services/character.service';
import {UserState} from '../../stores/states/user.state';
import {Store} from '@ngxs/store';
import {ItemService} from '../../../services/item.service';
import {IItem} from '../../models/Item';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})
export class ItemComponent implements OnInit {

  @Input('actions') actions = true;
  @Input('item') item: IItem;
  constructor(protected characterService: CharacterService, private store: Store, private itemService: ItemService) { }

  ngOnInit() {
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

}
