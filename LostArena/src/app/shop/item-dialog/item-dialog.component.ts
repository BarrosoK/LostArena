import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";
import {IItem} from "../../models/Item";
import {UserState} from "../../stores/states/user.state";
import {Store} from "@ngxs/store";
import {ItemService} from "../../../services/item.service";

@Component({
  selector: 'app-item-dialog',
  templateUrl: './item-dialog.component.html',
  styleUrls: ['./item-dialog.component.scss']
})
export class ItemDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public item: IItem, private store: Store, private itemService: ItemService) {
    console.log(item);
  }

  ngOnInit() {
    console.log(this.item);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async equip(itemId) {
    const c = await this.store.selectOnce(UserState.selectedCharacter).toPromise();
    const r = await this.itemService.equip(itemId, c._id).toPromise();
    this.dialogRef.close();
  }

  onSubmit() {
        this.dialogRef.close();
  }
}
