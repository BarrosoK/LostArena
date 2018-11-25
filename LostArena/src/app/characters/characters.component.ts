import { Component, OnInit } from '@angular/core';
import {CharacterService} from '../../services/character.service';
import {Store} from '@ngxs/store';
import {Character} from '../models/character';
import {SelectCharacter} from '../stores/actions/character.actions';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CreationComponent} from './creation/creation.component';
import {NavbarComponent} from "../navbar/navbar.component";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-characters',
  templateUrl: './characters.component.html',
  styleUrls: ['./characters.component.scss']
})
export class CharactersComponent implements OnInit {

  isMobile = false;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );


  constructor(protected characterService: CharacterService, public store: Store, public dialog: MatDialog,
              private breakpointObserver: BreakpointObserver, private snackbar: MatSnackBar) {
  }

  ngOnInit() {
    this.isHandset$.subscribe((onMobile) => {
      this.isMobile = onMobile;
    });
  }

  selectCharacter(character: Character) {
    this.store.dispatch(new SelectCharacter(character));
    this.snackbar.open(character.name + ' selected', 'Close');
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(CreationComponent, {
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
