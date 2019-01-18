import {Component, Input, OnInit} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {UserState} from '../../stores/states/user.state';
import {of} from "rxjs";
import {Character} from "../../models/Character";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input('character') character$ = null;
  @Input('extended') extended = false;
  @Input('items') items = false;

  constructor(private store: Store) { }

  ngOnInit() {
    if (!this.character$) {
      this.character$ = this.store.select(UserState.selectedCharacter);
    } else {
      this.character$ = of(new Character(this.character$));
    }
  }

}
