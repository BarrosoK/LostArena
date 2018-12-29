import { Component, OnInit } from '@angular/core';
import {ItemService} from "../../services/item.service";
import {IItem} from "../models/Item";
import {Subject} from "rxjs";
import {CharacterService} from "../../services/character.service";

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  items: Subject<IItem[]>;

  constructor(private itemService: ItemService, private characterService: CharacterService) {
    this.items = new Subject<IItem[]>();
  }

  buy(itemId) {
    this.characterService.selectedCharacter$.subscribe((c) => {
      if (!c) {
        return;
      }
      this.itemService.buy(itemId, c._id).subscribe((r) => {
        console.log(r);
      });
    });
  }

  ngOnInit() {
    this.itemService.getItems().subscribe((items) => {
      this.items.next(items);
    });
  }

}
