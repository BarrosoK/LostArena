import { Component, OnInit } from '@angular/core';
import {ItemService} from '../../services/item.service';
import {IItem} from '../models/Item';
import {Subject} from 'rxjs';
import {CharacterService} from '../../services/character.service';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {CreationComponent} from '../characters/creation/creation.component';
import {ItemDialogComponent} from "./item-dialog/item-dialog.component";
import {first} from "rxjs/operators";

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit {

  items: Subject<IItem[]>;

  constructor(private itemService: ItemService, private characterService: CharacterService, public dialog: MatDialog) {
    this.items = new Subject<IItem[]>();
  }

  buy(itemId) {
    this.characterService.selectedCharacter$.pipe(first()).subscribe((c) => {
      if (!c) {
        return;
      }
      this.itemService.buy(itemId, c._id).pipe(first()).subscribe((r) => {
        this.openDialog(r['item']);
      });
    });
  }

  ngOnInit() {
    this.itemService.getItems().subscribe((items) => {
      this.items.next(items);
    });
  }

  openDialog(item): void {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.autoFocus = true;

    dialogConfig.data = item;

    const dialogRef = this.dialog.open(ItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
