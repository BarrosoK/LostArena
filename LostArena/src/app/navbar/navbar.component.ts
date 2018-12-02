import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {Observable, Subscribable} from 'rxjs';
import { map } from 'rxjs/operators';
import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav, MatSidenavModule} from '@angular/material';
import {AuthService} from "../../services/auth.service";
import {SocketService} from "../../services/socket.service";
import {UserState, UserStateModel} from "../stores/states/user.state";
import {Store} from "@ngxs/store";
import {RemoveMessageSystem} from "../stores/actions/socket.actions";
import {SocketState} from "../stores/states/socket.state";
import {ICharacter} from "../models/Character";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  static isMobile = false;
  session$;
  selectedCharacter$: Observable<ICharacter>;

  @ViewChild('drawer') sidenav: MatSidenav;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  toogleNav() {
    console.log(this.sidenav);
  }

  onNavClick() {
    if (NavbarComponent.isMobile) {
      this.sidenav.close();
    }
  }


  ngOnInit() {
    this.session$ = this.store.select(UserState.user);
    this.isHandset$.subscribe((onMobile) => {
      NavbarComponent.isMobile = onMobile;
        if (!onMobile && !this.sidenav.opened) {
          this.sidenav.open();
        } else if (onMobile && this.sidenav.opened) {
          this.sidenav.close();
        }
    });
  }

  remove(index) {
    this.store.dispatch(new RemoveMessageSystem(index));
  }

  constructor(private breakpointObserver: BreakpointObserver, public authService: AuthService,
              public socket: SocketService, private store: Store) {
    this.selectedCharacter$ = this.store.select(UserState.selectedCharacter);
   }

}
