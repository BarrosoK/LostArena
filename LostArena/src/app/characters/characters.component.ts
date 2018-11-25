import { Component, OnInit } from '@angular/core';
import {CharacterService} from '../../services/character.service';
import {Store} from '@ngxs/store';
import {Character} from '../models/character';
import {SelectCharacter} from '../stores/actions/character.actions';
import {MatDialog} from '@angular/material';
import {CreationComponent} from './creation/creation.component';

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements OnInit {

  constructor(protected characterService: CharacterService, public store: Store, public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  selectCharacter(character: Character) {
    this.store.dispatch(new SelectCharacter(character));
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreationComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
